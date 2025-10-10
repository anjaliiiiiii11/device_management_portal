package com.example.deviceservice.dto;

public class OwnerDTO {
    private String ownerID;
    private String name;
    private String contactInfo;

    public OwnerDTO() {
    }

    public OwnerDTO(String ownerID, String name, String contactInfo) {
        this.ownerID = ownerID;
        this.name = name;
        this.contactInfo = contactInfo;
    }

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