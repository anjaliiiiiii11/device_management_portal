package com.example.deviceservice.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "owners")
public class Owner {

    @Id
    @Column(name = "owner_id", nullable = false, unique = true)
    private String ownerID;

    @Column(name = "name")
    private String name;

    @Column(name = "contact_info")
    private String contactInfo;

    // Default constructor
    public Owner() {
    }

    // Parameterized constructor
    public Owner(String ownerID, String name, String contactInfo) {
        this.ownerID = ownerID;
        this.name = name;
        this.contactInfo = contactInfo;
    }

    // Getters and Setters
    public String getOwnerID() {
        return ownerID;
    }

    public void setOwnerID(String ownerID) {
        this.ownerID = ownerID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContactInfo() {
        return contactInfo;
    }

    public void setContactInfo(String contactInfo) {
        this.contactInfo = contactInfo;
    }
}
