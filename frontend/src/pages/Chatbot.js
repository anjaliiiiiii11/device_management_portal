import React, { useState, useEffect, useRef } from "react";
import "../styles/Chatbot.css";

const Chatbot = () => {
  // Separate session storage keys for different chatbot types
  const [databaseMessages, setDatabaseMessages] = useState(() => {
    const saved = sessionStorage.getItem("chatMessages_database");
    return saved ? JSON.parse(saved) : [];
  });

  const [documentMessages, setDocumentMessages] = useState(() => {
    const saved = sessionStorage.getItem("chatMessages_document");
    return saved ? JSON.parse(saved) : [];
  });

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [popupImage, setPopupImage] = useState(null);
  const [currentChatbotType, setCurrentChatbotType] = useState("database"); // default
  const [showContextSuggestions, setShowContextSuggestions] = useState(false);
  const [contextSuggestions, setContextSuggestions] = useState([]);
  const [currentContext, setCurrentContext] = useState({});

  const [hasGreeted, setHasGreeted] = useState(() => {
    return sessionStorage.getItem("hasGreeted") === "true";
  });

  const messagesEndRef = useRef(null);
  const messagesEndRefExpanded = useRef(null);

  // Get current messages based on chatbot type
  const getCurrentMessages = () => {
    return currentChatbotType === "database" ? databaseMessages : documentMessages;
  };

  const setCurrentMessages = (messages) => {
    if (currentChatbotType === "database") {
      setDatabaseMessages(messages);
    } else {
      setDocumentMessages(messages);
    }
  };

  // Persist messages separately
  useEffect(() => {
    sessionStorage.setItem("chatMessages_database", JSON.stringify(databaseMessages));
  }, [databaseMessages]);

  useEffect(() => {
    sessionStorage.setItem("chatMessages_document", JSON.stringify(documentMessages));
  }, [documentMessages]);

  useEffect(() => {
    sessionStorage.setItem("hasGreeted", hasGreeted);
  }, [hasGreeted]);

  // Auto scroll function
  const scrollToBottom = () => {
    setTimeout(() => {
      if (!isExpanded && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
      if (isExpanded && messagesEndRefExpanded.current) {
        messagesEndRefExpanded.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 300);
  };

  // Auto scroll on message changes
  useEffect(() => {
    scrollToBottom();
  }, [databaseMessages, documentMessages, isExpanded]);

  // Auto scroll when switching tabs
  useEffect(() => {
    scrollToBottom();
  }, [currentChatbotType]);

  const fetchCurrentContext = async () => {
    try {
      const res = await fetch("http://localhost:5000/context");
      const data = await res.json();
      setCurrentContext(data.context || {});
    } catch (err) {
      console.error("Error fetching context:", err);
    }
  };

  const clearContext = async () => {
    try {
      await fetch("http://localhost:5000/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" })
      });
      setCurrentContext({});
      const newMessage = {
        text: "Context cleared! You can now ask fresh questions.",
        sender: "bot",
        timestamp: Date.now(),
        type: "text"
      };
      setCurrentMessages([...getCurrentMessages(), newMessage]);
    } catch (err) {
      console.error("Error clearing context:", err);
    }
  };

  const isGreeting = (text) => {
    const lowerText = text.toLowerCase().trim();
    const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"];
    return greetings.some(
      (g) =>
        lowerText === g ||
        lowerText.startsWith(g + " ") ||
        lowerText.startsWith(g + ",")
    );
  };

  const handleChatOpen = () => {
    setIsOpen(true);
    if (!hasGreeted) {
      const greetingMessage = {
        text: "Hello! I'm BOB, your AI assistant. I can help you with:\n1. Device data analysis\n2. Owner information\n3. Status tracking\n4. Portal features and diagrams\n\nHow can I assist you today?",
        sender: "bot",
        timestamp: Date.now(),
        type: "text"
      };

      // Add greeting to both message arrays
      setDatabaseMessages([greetingMessage]);
      setDocumentMessages([greetingMessage]);
      setHasGreeted(true);
    }
  };

  const handleContextSuggestion = async (suggestion, index) => {
    const userMessage = { text: suggestion, sender: "user", timestamp: Date.now() };
    setCurrentMessages([...getCurrentMessages(), userMessage]);
    setShowContextSuggestions(false);
    setContextSuggestions([]);
    setLoading(true);

    let contextChoice = null;
    if (suggestion.includes("Global query")) {
      contextChoice = "global";
    } else if (suggestion.includes("Clear context")) {
      contextChoice = "clear";
    }

    try {
      const res = await fetch("http://localhost:5000/unified_chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: suggestion,
          history: getCurrentMessages(),
          summaries: {},
          context_choice: contextChoice,
          chatbot_type: currentChatbotType
        }),
      });
      const data = await res.json();
      setLoading(false);

      const botMessage = {
        text: data.answer || "I can't understand that. Could you please elaborate?",
        sender: "bot",
        timestamp: Date.now(),
        type: data.type || "text",
        images: data.images || []
      };

      if (data.summary) {
        botMessage.summary = data.summary;
      }

      setCurrentMessages(prev => [...prev, botMessage]);
      fetchCurrentContext();
    } catch (err) {
      console.error("Chatbot error:", err);
      setLoading(false);
      const errorMessage = {
        text: "I encountered an error. Please try again.",
        sender: "bot",
        timestamp: Date.now()
      };
      setCurrentMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;

    const userMessage = { text: question, sender: "user", timestamp: Date.now() };
    const currentQuestion = question;
    setQuestion("");

    // Handle greetings locally
    if (isGreeting(currentQuestion)) {
      setCurrentMessages([...getCurrentMessages(), userMessage]);
      setLoading(true);

      setTimeout(() => {
        const greetingResponse = {
          text: "1. Nice to meet you!\n2. I'm here to help with device data analysis and portal information\n3. What would you like to know?",
          sender: "bot",
          timestamp: Date.now(),
          type: "text"
        };
        setCurrentMessages(prev => [...prev, greetingResponse]);
        setLoading(false);
      }, 800);
      return;
    }

    // Handle special commands
    if (currentQuestion.toLowerCase() === "clear context") {
      clearContext();
      return;
    }

    if (currentQuestion.toLowerCase() === "show context") {
      const contextStr = Object.keys(currentContext).length > 0
        ? Object.entries(currentContext).map(([k, v]) => `${k}: ${v}`).join(", ")
        : "No context stored";
      const contextMessage = {
        text: `Current context: ${contextStr}`,
        sender: "bot",
        timestamp: Date.now()
      };
      setCurrentMessages([...getCurrentMessages(), userMessage, contextMessage]);
      return;
    }

    // Add user message to current chatbot type messages
    setCurrentMessages([...getCurrentMessages(), userMessage]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/unified_chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion,
          history: getCurrentMessages(),
          summaries: {},
          chatbot_type: currentChatbotType
        }),
      });
      const data = await res.json();
      setLoading(false);

      // Update chatbot type if returned by server
      if (data.chatbot_type && data.chatbot_type !== "general") {
        setCurrentChatbotType(data.chatbot_type);
      }

      // Handle ambiguous questions with context suggestions
      if (data.ambiguous && data.context_suggestions) {
        setContextSuggestions(data.context_suggestions);
        setShowContextSuggestions(true);
        const botMessage = {
          text: "I found multiple ways to interpret your question. Please choose one:",
          sender: "bot",
          timestamp: Date.now(),
          type: "text"
        };
        setCurrentMessages(prev => [...prev, botMessage]);
      } else {
        const botMessage = {
          text: data.answer || "I can't understand that. Could you please elaborate?",
          sender: "bot",
          timestamp: Date.now(),
          type: data.type || "text",
          images: data.images || []
        };

        if (data.summary) {
          botMessage.summary = data.summary;
        }

        // Only add bot message to current messages (user message already added above)
        setCurrentMessages(prev => [...prev, botMessage]);

        fetchCurrentContext();
      }
    } catch (err) {
      console.error("Chatbot error:", err);
      setLoading(false);
      const errorMessage = {
        text: "I encountered an error. Please try again.",
        sender: "bot",
        timestamp: Date.now()
      };
      setCurrentMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleImageClick = (url) => setPopupImage(url);
  const closePopup = () => setPopupImage(null);

  useEffect(() => {
    const handleKeyDown = (e) => e.key === "Escape" && closePopup();
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const extractImageUrls = (text) => {
    const regex = /https?:\/\/localhost:5000\/static\/images\/[^\s]+\.(jpeg|jpg|gif|png|webp|svg)/gi;
    return text.match(regex) || [];
  };

  const formatResponseAsPoints = (text) => {
    // Check if text should be formatted as points (over 50 characters)
    if (text.length <= 50) {
      return text;
    }

    const lines = text.split('\n').filter(line => line.trim());

    // If already formatted with numbers, return as is
    if (lines.some(line => /^\d+\.\s/.test(line.trim()))) {
      return text;
    }

    // Format as numbered points
    const formattedLines = lines.map((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        // Remove existing bullet points or asterisks
        const cleanLine = trimmedLine.replace(/^[•*-]\s*/, '');
        return `${index + 1}. ${cleanLine}`;
      }
      return trimmedLine;
    });

    return formattedLines.join('\n');
  };

  const renderMessageContent = (msg) => {
    const { text, sender, images = [], type } = msg;

    if (type === "table") {
      return (
        <div>
          {msg.summary && <p style={{ margin: "0 0 6px 0", fontWeight: "bold" }}>{msg.summary}:</p>}
          <div
            dangerouslySetInnerHTML={{ __html: text }}
            style={{ maxHeight: "250px", overflowY: "auto", fontSize: "11px" }}
          />
        </div>
      );
    }

    if (sender === "bot") {
      const imageUrls = extractImageUrls(text);
      let processedText = text;

      // Remove image URLs and asterisks from text
      imageUrls.forEach((url) => {
        processedText = processedText.replace(url, "");
      });

      // Remove asterisks and bullet points
      processedText = processedText.replace(/\*/g, "");
      processedText = processedText.replace(/•/g, "");

      // Clean up extra whitespace
      processedText = processedText.replace(/\s+/g, " ").trim();

      // Remove localhost references
      processedText = processedText.replace(/http:\/\/localhost:5000[^\s]*/g, "");

      // Format as numbered points if over 50 characters
      processedText = formatResponseAsPoints(processedText);

      return (
        <div>
          <div style={{ whiteSpace: "pre-wrap" }}>
            {processedText}
          </div>

          {images.length > 0 && (
            <div className="chatbot-thumbnails">
              {images.map((url, idx) => {
                const filename = url.split("/").pop();
                return (
                  <div key={idx} className="chatbot-thumbnail" onClick={() => handleImageClick(url)}>
                    <span>🖼️</span>
                    <span className="chatbot-thumb-text">View: {filename.replace(/\.[^/.]+$/, "")}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }
    return text;
  };

  const switchChatbotType = (type) => {
    setCurrentChatbotType(type);
  };

  return (
    <div>
      {/* Floating button */}
      {!isOpen && (
        <button className="chatbot-button" onClick={handleChatOpen}>
          💬
        </button>
      )}

      {/* Small Chat */}
      {isOpen && !isExpanded && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div>
              <h3>BOB - AI Assistant</h3>
              <div className="chatbot-type-switcher">
                <button
                  className={currentChatbotType === "database" ? "active" : ""}
                  onClick={() => switchChatbotType("database")}
                  title="Database queries and data analysis"
                >
                  📊 Data
                </button>
                <button
                  className={currentChatbotType === "document" ? "active" : ""}
                  onClick={() => switchChatbotType("document")}
                  title="Portal documentation and features"
                >
                  📋 About Portal
                </button>
              </div>
            </div>
            <div>
              <button onClick={() => setIsExpanded(true)}>⤢</button>
              <button onClick={() => setIsOpen(false)}>✖</button>
            </div>
          </div>
          <div className="chatbot-messages">
            {getCurrentMessages().map((msg, i) => (
              <div key={i} className={`chatbot-msg ${msg.sender}`}>
                <div className="chatbot-bubble">{renderMessageContent(msg)}</div>
              </div>
            ))}

            {showContextSuggestions && (
              <div style={{ margin: "6px 0" }}>
                <p style={{ fontSize: "12px", fontWeight: "bold", margin: "3px 0" }}>Please choose:</p>
                {contextSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleContextSuggestion(suggestion, index)}
                    style={{
                      display: "block",
                      width: "100%",
                      margin: "3px 0",
                      padding: "6px 8px",
                      background: "#f0f8ff",
                      border: "1px solid #007bff",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "11px",
                      textAlign: "left",
                    }}
                  >
                    {index + 1}. {suggestion}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="chatbot-msg bot">
                <span className="chatbot-bubble">BOB is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef}></div>
          </div>
          <div className="chatbot-input-area">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleAsk()}
              placeholder={currentChatbotType === "database" ? "Ask about devices, owners..." : "Ask about portal features..."}
              disabled={loading}
            />
            <button onClick={handleAsk} disabled={loading || !question.trim()}>
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}

      {/* Expanded Chat */}
      {isExpanded && (
        <div className="chatbot-overlay" onClick={(e) => e.target === e.currentTarget && setIsExpanded(false)}>
          <div className="chatbot-expanded" onClick={(e) => e.stopPropagation()}>
            <div className="chatbot-header">
              <div>
                <span>BOB - AI Assistant</span>
                <div className="chatbot-type-switcher">
                  <button
                    className={currentChatbotType === "database" ? "active" : ""}
                    onClick={() => switchChatbotType("database")}
                    title="Database queries and data analysis"
                  >
                    📊 Data
                  </button>
                  <button
                    className={currentChatbotType === "document" ? "active" : ""}
                    onClick={() => switchChatbotType("document")}
                    title="Portal documentation and features"
                  >
                    📋 About Portal
                  </button>
                </div>
              </div>
              <div>
                <button onClick={() => setIsExpanded(false)}>⤡</button>
                <button
                  onClick={() => {
                    setIsExpanded(false);
                    setIsOpen(false);
                  }}
                >
                  ✖
                </button>
              </div>
            </div>
            <div className="chatbot-messages expanded">
              {getCurrentMessages().map((msg, i) => (
                <div key={i} className={`chatbot-msg ${msg.sender}`}>
                  <div className="chatbot-bubble">{renderMessageContent(msg)}</div>
                </div>
              ))}

              {showContextSuggestions && (
                <div style={{ margin: "10px 0" }}>
                  <p style={{ fontSize: "14px", fontWeight: "bold", margin: "8px 0" }}>Please choose:</p>
                  {contextSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleContextSuggestion(suggestion, index)}
                      style={{
                        display: "block",
                        width: "100%",
                        margin: "6px 0",
                        padding: "10px 14px",
                        background: "#f0f8ff",
                        border: "1px solid #007bff",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        textAlign: "left",
                      }}
                    >
                      {index + 1}. {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {loading && (
                <div className="chatbot-msg bot">
                  <span className="chatbot-bubble">BOB is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRefExpanded}></div>
            </div>
            <div className="chatbot-input-area">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && handleAsk()}
                placeholder={currentChatbotType === "database" ? "Ask about devices, owners, or type 'clear context'..." : "Ask about portal features or request diagrams..."}
                disabled={loading}
              />
              <button onClick={handleAsk} disabled={loading || !question.trim()}>
                {loading ? "Thinking..." : "Ask"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image */}
      {popupImage && (
        <div className="chatbot-popup" onClick={closePopup}>
          <div className="chatbot-popup-inner" onClick={(e) => e.stopPropagation()}>
            <button className="chatbot-popup-close" onClick={closePopup}>✖</button>
            <img src={popupImage} alt="Diagram" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;