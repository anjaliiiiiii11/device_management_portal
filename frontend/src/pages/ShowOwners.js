import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, CardActions, Button, CardHeader,
  IconButton, Pagination, TextField, Modal, Fade, Backdrop
} from '@mui/material';
import { Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const CARDS_PER_PAGE = 3;

const ShowOwners = () => {
  const [page, setPage] = useState(1);
  const [searchId, setSearchId] = useState('');
  const [updatedName, setUpdatedName] = useState('');
  const [updatedContact, setUpdatedContact] = useState('');
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [owners, setOwners] = useState([]);

  const fetchOwners = async () => {
    try {
      const response = await axios.get('http://localhost:8083/owners');
      const owners = response.data.map(o => ({
        ownerId: o.ownerID,
        name: o.name,
        contact_info: o.contactInfo
        // ,createdOn: o.createdOn || 'N/A',
        // updatedOn: o.updatedOn || 'N/A'
      }));
      setOwners(owners);
    } catch (error) {
      console.error('Failed to fetch owners:', error);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const filteredCards = owners.filter(card =>
    card.ownerId.toString().includes(searchId.trim())
  );

  const startIndex = (page - 1) * CARDS_PER_PAGE;
  const paginatedCards = filteredCards.slice(startIndex, startIndex + CARDS_PER_PAGE);

  const handleUpdateClick = (owner) => {
    setSelectedOwner(owner);
    setUpdatedName(owner.name);
    setUpdatedContact(owner.contact_info);
    setShowUpdateModal(true);
  };

const handleUpdateSubmit = async () => {
  try {
    await axios.patch(`http://localhost:8083/owners/${selectedOwner.ownerId}`, {
      name: updatedName,
      contactInfo: updatedContact
    });

    // Update local state optimistically
    setOwners(prev =>
      prev.map(o =>
        o.ownerId === selectedOwner.ownerId
          ? {
              ...o,
              name: updatedName,
              contact_info: updatedContact,
              updatedOn: new Date().toISOString().split('T')[0]
            }
          : o
      )
    );

    setShowUpdateModal(false);
  } catch (error) {
    console.error('Failed to update owner:', error);
  }
};


  const handleDeleteClick = (owner) => {
    setSelectedOwner(owner);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    setOwners(prev => prev.filter(o => o.ownerId !== selectedOwner.ownerId));
    setShowDeleteModal(false);
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#F5EDE3', minHeight: '100vh' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <TextField
          label="Search Owner ID"
          variant="outlined"
          value={searchId}
          onChange={(e) => {
            setSearchId(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 300 }}
        />
      </Box>

      {paginatedCards.length > 0 ? (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 3,
            }}
          >
            {paginatedCards.map((card) => (
              <Card
                key={card.ownerId}
                sx={{
                  borderRadius: 4,
                  boxShadow: 4,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                  },
                  background: 'linear-gradient(145deg, #ffffff, #f0e6d8)',
                }}
              >
                <CardHeader
                  action={<IconButton><PersonIcon /></IconButton>}
                  title="OWNER DETAILS"
                  sx={{
                    backgroundColor: '#fdf6ee',
                    borderBottom: '1px solid #e0d6c8',
                    fontWeight: 'bold',
                  }}
                />
                <CardContent sx={{ px: 3, py: 2 }}>
                  <Typography variant="body1"><strong>OWNER ID:</strong> {card.ownerId}</Typography>
                  <Typography variant="body1"><strong>NAME:</strong> {card.name}</Typography>
                  <Typography variant="body1"><strong>CONTACT:</strong> {card.contact_info}</Typography>
                  {/* <Typography variant="body1"><strong>CREATED ON:</strong> {card.createdOn}</Typography>
                  <Typography variant="body1"><strong>UPDATED ON:</strong> {card.updatedOn}</Typography> */}
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<EditIcon />}
                    sx={{ borderRadius: 2 }}
                    onClick={() => handleUpdateClick(card)}
                  >
                    UPDATE
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    sx={{ borderRadius: 2 }}
                    onClick={() => handleDeleteClick(card)}
                  >
                    DELETE
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={Math.ceil(filteredCards.length / CARDS_PER_PAGE)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h6" color="error" gutterBottom>
            OOPS!! ENTERED OWNER NOT FOUND
          </Typography>
          <Typography variant="body1" gutterBottom>
            RE-ENTER THE OWNER ID
          </Typography>
          <Link to="/register-owner" style={{ textDecoration: 'none', color: '#1976d2' }}>
            OR REGISTER A NEW OWNER
          </Link>
        </Box>
      )}

      {/* Update Modal */}
      <Modal
        open={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={showUpdateModal}>
          <Box sx={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400, bgcolor: 'background.paper',
            borderRadius: 2, boxShadow: 24, p: 4
          }}>
            <Typography variant="h6" mb={2}>Update Owner</Typography>
            <TextField
              label="Owner ID"
              value={selectedOwner?.ownerId || ''}
              fullWidth
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              label="Name"
              value={updatedName}
              onChange={(e) => setUpdatedName(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Contact Info"
              value={updatedContact}
              onChange={(e) => setUpdatedContact(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="contained" color="success" onClick={handleUpdateSubmit}>
                Submit
              </Button>
              <Button variant="outlined" onClick={() => setShowUpdateModal(false)}>Cancel</Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={showDeleteModal}>
          <Box sx={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400, bgcolor: 'background.paper',
            borderRadius: 2, boxShadow: 24, p: 4
          }}>
            <Typography variant="h6" mb={2}>Confirm Delete</Typography>
            <Typography variant="body1" mb={3}>
              Are you sure you want to delete owner <strong>{selectedOwner?.name}</strong> (ID: {selectedOwner?.ownerId})?
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
                Delete
              </Button>
              <Button variant="outlined" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default ShowOwners;
