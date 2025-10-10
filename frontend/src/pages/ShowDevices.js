import React,  { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Card, CardContent, Typography, CardActions, Button, CardHeader,
  IconButton, Pagination, TextField, ToggleButton, ToggleButtonGroup,
  Menu, MenuItem, FormControlLabel, Checkbox, Divider, Select, InputLabel,
  FormControl, Modal, Fade, Backdrop, Tooltip, CircularProgress
} from '@mui/material';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ListAltIcon from '@mui/icons-material/ListAlt';
import RestoreIcon from '@mui/icons-material/Restore';
  import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Grid } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ShowDevices = () => {
const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [typeChecked, setTypeChecked] = useState(false);
  const [modelChecked, setModelChecked] = useState(false);
  const [ownerChecked, setOwnerChecked] = useState(false);
  const [type, setType] = useState('');
  const [model, setModel] = useState('');
  const [owner, setOwner] = useState("");
  const [sortBy, setSortBy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [ownerId, setOwnerId] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [cards, setCards] = useState([]);
  const open = Boolean(anchorEl);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleFilterClick = (event) => setAnchorEl(event.currentTarget);
  const handleFilterClose = () => setAnchorEl(null);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [cardsPerPage, setCardsPerPage] = useState(3);
  const [formData, setFormData] = useState({
  deviceID: '',
  name: '',
  manufacturer: '',
  type: '',
  status: '',
  purchaseDate: '',
});
//added this
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

 

const handleStatusChange = (event, newStatus) => {
  if (newStatus !== null) {
    setStatus(newStatus);
    setPage(1);
 
    if (newStatus === 'ACTIVE') {
      fetchActiveDevices();
    } else if (newStatus === 'INACTIVE') {
      fetchInactiveDevices();
    }
    else if(newStatus === 'RETIRED'){
      fetchRetiredDevices();
    }
  }
};
 
  const fetchActiveDevices = async () => {
  try {
    //added this
    setLoading(true);
    setError(null);
    const response = await axios.get('http://localhost:8083/devices', {
      params: {
        status: 'active',
        includeDeleted: false
      }
    });
    const devices = response.data.map(d => ({
      deviceId: d.device.deviceID,
      name: d.device.name,
      type: d.device.type,
      manufacturer: d.device.manufacturer,
      purchaseDate: d.device.purchaseDate,
      createdOn: d.device.createdOn,
      deletedOn: d.device.deletedOn,
      owner: d.device.ownerID,
      updatedOn: d.device.lastUpdate,
      status: d.device.status
      }));
      setCards(devices);
      console.log(devices);
    } catch (error) {
    console.error('Failed to fetch active devices:', error);
    setError("Failed to fetch active devices");
  } finally {
    setLoading(false);
  }
  };
 
  useEffect(() => {
    fetchActiveDevices();
  }, []);
 
  const fetchInactiveDevices = async () => {
  try {
    //added this
    setLoading(true);
    setError(null);
    const response = await axios.get('http://localhost:8083/devices', {
      params: {
        status: 'inactive',
        includeDeleted: true
      }
    });
    const devices = response.data.map(d => ({
      deviceId: d.device.deviceID,
      name: d.device.name,
      type: d.device.type,
      manufacturer: d.device.manufacturer,
      purchaseDate: d.device.purchaseDate,
      createdOn: d.device.createdOn,
      deletedOn: d.device.deletedOn,
      owner: d.device.ownerID,
      status: d.device.status
    }));
    setCards(devices);
  } catch (error) {
    console.error('Failed to fetch inactive devices:', error);
    setError("Failed to fetch inactive devices");
  } finally {
    setLoading(false);
  }
};
 
  const fetchRetiredDevices = async () => {
  try {
    //added this
    setLoading(true);
    setError(null);
    const response = await axios.get('http://localhost:8083/devices', {
      params: {
        status: 'Retired',
        includeDeleted: false
      }
    });
    const devices = response.data.map(d => ({
      deviceId: d.device.deviceID,
      name: d.device.name,
      type: d.device.type,
      manufacturer: d.device.manufacturer,
      purchaseDate: d.device.purchaseDate,
      createdOn: d.device.createdOn,
      deletedOn: d.device.deletedOn,
      owner: d.device.ownerID,
      status: d.device.status
      }));
      setCards(devices);
      console.log(devices);
    } catch (error) {
    console.error('Failed to fetch active devices:', error);
    setError("Failed to fetch active devices");
  } finally {
    setLoading(false);
  }
  };

useEffect(() => {
  if (!filtersApplied) {
    if (status === "ACTIVE") fetchActiveDevices();
    else if (status === "INACTIVE") fetchInactiveDevices();
    else if (status === "RETIRED") fetchRetiredDevices();
  }
}, [status, filtersApplied]);

const updateDeviceDetails = async (deviceID, updatedData) => {
  try {
    const response = await axios.patch(`http://localhost:8083/devices/${deviceID}/update`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Error updating device:", error);
    throw error;
  }
};

const handleSubmit = async () => {
  try {
    const updatedData = {
      name: selectedDevice.name,
      manufacturer: selectedDevice.manufacturer,
      type: selectedDevice.type,
      status: selectedDevice.status,
      purchaseDate: selectedDevice.purchaseDate,
    };
 
    await updateDeviceDetails(selectedDevice.deviceId, updatedData);
 
    setShowUpdateModal(false);
    setSelectedDevice(null);
 
    // Refresh the device list
    if (status === "ACTIVE") fetchActiveDevices();
    else if (status === "INACTIVE") fetchInactiveDevices();
    else if (status === "RETIRED") fetchRetiredDevices();
 
    toast.success("Device updated successfully!");
  } catch (error) {
    toast.error("Failed to update device.");
  }
};
 
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };
 
  //added this
const handleDeleteDevice = async () => {
    if (!selectedDevice) return;
    try {
      await axios.delete(`http://localhost:8083/devices/${selectedDevice.deviceId}/soft-delete`);
      setShowDeleteModal(false);
      setSelectedDevice(null);
 
      // Refresh list
      if (status === "ACTIVE") fetchActiveDevices();
      else if (status === "INACTIVE") fetchInactiveDevices();
      else if (status === "RETIRED") fetchRetiredDevices();
 
      toast.success("Device deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete device.");
    }
  };

const handleRestore = async (deviceId) => {
  try {
    await axios.patch(`http://localhost:8083/devices/${deviceId}/recover`);
    toast.success("Device restored!");

    fetchInactiveDevices();
    toast.success("Device restored successfully!");
  } catch (error) {
    toast.error("Failed to restore device.");
  }
};

const fetchFilteredDevices = async () => {
  try {
    const response = await axios.get('http://localhost:8083/devices', {
params: {
  deviceID: searchTerm || null,
  type: type || null,
  manufacturer: model || null,
  ownerID: owner ? `OWN${owner}` : null,
  status: status || null,
  startDate: startDate || null,
  endDate: endDate || null,
  includeDeleted: status === 'INACTIVE'
}

    });

const devices = response.data.map(d => ({
  deviceId: d.device.deviceID,
  name: d.device.name,
  type: d.device.type,
  manufacturer: d.device.manufacturer,
  purchaseDate: d.device.purchaseDate,
  createdOn: d.device.createdOn,
  deletedOn: d.device.deletedOn,
  owner: d.device.ownerID,
  updatedOn: d.device.lastUpdate,
  status: d.device.status ? d.device.status.toLowerCase() : "unknown"
 
}));


    setCards(devices);
  } catch (error) {
    console.error('Failed to fetch filtered devices:', error);
    toast.error('Error fetching filtered devices');
  }
};

const finalCards = [...cards].sort((a, b) => {
  const parseDate = (dateStr) => new Date(dateStr || '1970-01-01');

  switch (sortBy) {
    case 'purchaseDate':
      return parseDate(b.purchaseDate) - parseDate(a.purchaseDate);
    case 'recentActivity':
      return parseDate(b.updatedOn) - parseDate(a.updatedOn);
    case 'createdOn':
      return parseDate(b.createdOn) - parseDate(a.createdOn);
    case 'deletedOn':
      return parseDate(b.deletedOn) - parseDate(a.deletedOn);
    default:
      return 0;
  }
});
 
 const startIndex = (page - 1) * cardsPerPage;
const paginatedCards = finalCards.slice(startIndex, startIndex + cardsPerPage);
 //added this
    if (loading) {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
      <CircularProgress />
      <Typography sx={{ ml: 2 }}>Loading devices...</Typography>
    </Box>
  );
}

if (error) {
  return (
    <Box textAlign="center" mt={5}>
      <Typography color="error">{error}</Typography>
    </Box>
  );
}

// if (cards.length === 0) {
//   return (
//     <Box textAlign="center" mt={5}>
//       <DevicesOtherIcon sx={{ fontSize: 50, color: "grey.500" }} />
//       <Typography variant="h6" mt={2}>
//         No devices found
//       </Typography>
//     </Box>
//   );
// }

 
  return (

    <Box sx={{ p: 4, backgroundColor: '#F5EDE3', minHeight: '100vh' }}>
      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <ToggleButtonGroup
          value={status}
          exclusive
          onChange={handleStatusChange}
          aria-label="device status"
          color="primary"
        >
          <ToggleButton value="ACTIVE">ACTIVE</ToggleButton>
          <ToggleButton value="INACTIVE">INACTIVE</ToggleButton>
          <ToggleButton value="RETIRED">RETIRED</ToggleButton>
        </ToggleButtonGroup>
 
         {/*added this */}
        <Box
  sx={{
    mb: 3,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 2,
  }}
>
 
  {/* Right side: dropdown + search + filter */}
 <div className="search-controls">
  {/* Devices per page input */}
  <FormControl sx={{ minWidth: 150, marginRight: 2 }}>
    <TextField
      type="number"
      label="Devices per Page"
      value={cardsPerPage}
      onChange={(e) => {
        const value = Number(e.target.value);
        if (value > 0) {
          setCardsPerPage(value);
          setPage(1);
        }
      }}
      inputProps={{ min: 1, max: 100 }}
    />
  </FormControl>
 
  {/* Search bar*/}
<TextField
  label="Search Devices"
  variant="outlined"
  value={searchTerm}
  onChange={handleSearchChange}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      fetchFilteredDevices();
    }
  }}
  sx={{ minWidth: 250, marginRight: 2 }}
/>

  {/* Filter button */}
  <IconButton onClick={handleFilterClick}>
    <FilterListIcon />
  </IconButton>
</div>
 
</Box>
{/* Filter Menu */}
       <Menu anchorEl={anchorEl} open={open} onClose={handleFilterClose}>
  {/* Type Filter */}
  <MenuItem>
    <FormControl fullWidth>
      <InputLabel>Type</InputLabel>
      <Select native value={type} onChange={(e) => setType(e.target.value)}>
        <option value=""></option>
        <option value="Laptop">Laptop</option>
        <option value="Router">Router</option>
        <option value="Smartphone">Smartphone</option>
        <option value="Smartwatch">Smartwatch</option>
        <option value="Tablet">Tablet</option>
      </Select>
    </FormControl>
  </MenuItem>
 
  {/* Manufacturer Filter */}
  <MenuItem>
    <FormControl fullWidth>
      <InputLabel>Manufacturer</InputLabel>
      <Select native value={model} onChange={(e) => setModel(e.target.value)}>
        <option value=""></option>
        <option value="Cisco">Cisco</option>
        <option value="Garmin">Garmin</option>
        <option value="Dell">Dell</option>
        <option value="Samsung">Samsung</option>
        <option value="Apple">Apple</option>
      </Select>
    </FormControl>
  </MenuItem>
 
  {/* Owner Filter */}
 
  <MenuItem>
<TextField
  label="Owner ID"
  variant="standard"
  value={owner}
  onChange={(e) => setOwner(e.target.value)}
  fullWidth
  InputProps={{
    startAdornment: <InputAdornment position="start">OWN</InputAdornment>,
  }}
/>
  </MenuItem>
 
 
  {/* Purchase Date Range */}
  <MenuItem>
    <TextField
      label="Start Date"
      type="date"
      InputLabelProps={{ shrink: true }}
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      fullWidth
    />
  </MenuItem>
  <MenuItem>
    <TextField
      label="End Date"
      type="date"
      InputLabelProps={{ shrink: true }}
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      fullWidth
    />
  </MenuItem>
 
  
<MenuItem>
  <FormControl fullWidth>
    <InputLabel>Sort By</InputLabel>
    <Select
      native
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
    >
      <option value=""></option>
      <option value="recentActivity">Recent Activity</option>
      <option value="purchaseDate">Purchase Date</option>
      <option value="createdOn">Created On</option>
      <option value="deletedOn">Deleted On</option>
    </Select>
  </FormControl>
</MenuItem>
 
 
{/* Apply Button */}
  <MenuItem>
    <Button
      variant="contained"
      fullWidth
onClick={() => {
  handleFilterClose();
  setFiltersApplied(true);
  fetchFilteredDevices();
}}

      sx={{
        backgroundColor: '#000',
        color: '#fff',
        '&:hover': {
          backgroundColor: '#333',
        },
      }}
    >
      Apply
    </Button>
  </MenuItem>
 
  {/* Clear All Filters Button */}
<MenuItem>
<Button
  variant="contained"
  fullWidth
  onClick={() => {
    setType('');
    setModel('');
    setOwner('');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setSortBy('');
    setFiltersApplied(false);
    handleFilterClose();
    // Fetch based on current status
    if (status === "ACTIVE") fetchActiveDevices();
    else if (status === "INACTIVE") fetchInactiveDevices();
    else if (status === "RETIRED") fetchRetiredDevices();
  }}
  sx={{
    backgroundColor: '#000',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#333',
    },
  }}
>
  Clear All Filters
</Button>

</MenuItem>
</Menu>
 
 
 
      </Box>
 
      {/* Cards */}
      {paginatedCards.length > 0 ? (
  <>
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 3 }}>
      {paginatedCards.map((card) => {
  const statusLower = card.status?.toLowerCase();
  const isActive = statusLower === "active";
  const isInactive = statusLower === "inactive";
  const isRetired = statusLower === "retired";

        return (
          <Card
            key={card.deviceId}
            sx={{
              borderRadius: 4,
              boxShadow: 4,
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'translateY(-6px)' },
              background: 'linear-gradient(145deg, #ffffff, #f0e6d8)',
            }}
          >
            <CardHeader
              action={<IconButton><DevicesOtherIcon /></IconButton>}
              title={card.name}
              sx={{ backgroundColor: '#fdf6ee', borderBottom: '1px solid #e0d6c8', fontWeight: 'bold' }}
            />
            <CardContent sx={{ px: 3, py: 2 }}>
              <Typography variant="body1"><strong>DEVICE ID:</strong> {card.deviceId}</Typography>
              <Typography variant="body1"><strong>TYPE:</strong> {card.type}</Typography>
              <Typography variant="body1"><strong>MANUFACTURER:</strong> {card.manufacturer}</Typography>
              <Typography variant="body1"><strong>PURCHASE DATE:</strong> {card.purchaseDate}</Typography>
              <Typography variant="body1"><strong>UPDATED ON:</strong> {card.updatedOn}</Typography>
              <Typography variant="body1"><strong>CREATED ON:</strong> {card.createdOn}</Typography>
              <Typography variant="body1"><strong>DELETED ON:</strong> {card.deletedOn || 'N/A'}</Typography>
              <Typography variant="body1"><strong>OWNER:</strong> {card.owner || 'Unassigned'}</Typography>
            </CardContent>
 
            <CardActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
              {isActive ? (
                // ✅ Active device buttons
                <Grid container spacing={2}>
                  {/* UPDATE */}
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<EditIcon />}
                      fullWidth
                      sx={{ borderRadius: 2 }}
                      onClick={() => {
                        setSelectedDevice(card);
                        setShowUpdateModal(true);
                      }}
                    >
                      UPDATE
                    </Button>
                  </Grid>
 
                  {/* DELETE */}
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<DeleteIcon />}
                      fullWidth
                      sx={{ borderRadius: 2 }}
                      onClick={() => {
                        setSelectedDevice(card);
                        setShowDeleteModal(true);
                      }}
                    >
                      DELETE
                    </Button>
                  </Grid>
 
                  {/* ASSIGN OWNER */}
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      startIcon={<PersonAddIcon />}
                      fullWidth
                      sx={{
                        borderRadius: 2,
                        backgroundColor: '#9c27b0',
                        color: '#ffffff',
                        '&:hover': {
                          backgroundColor: '#7b1fa2',
                        },
                      }}
                      onClick={() => {
                        setSelectedDevice(card);
                        setShowAssignModal(true);
                       
                      }}
                    >
                      ASSIGN OWNER
                    </Button>
                  </Grid>
 
                  {/* AUDIT LOG */}
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      startIcon={<ListAltIcon />}
                      fullWidth
                      sx={{
                        borderRadius: 2,
                        backgroundColor: '#1976d2',
                        color: '#ffffff',
                        '&:hover': {
                          backgroundColor: '#1565c0',
                        },
                      }}
                      onClick={() => navigate(`/audit-log/${card.deviceId}`)}
                    >
                      AUDIT LOG
                    </Button>
                  </Grid>
                </Grid>
              ) : isInactive ? (
                // ⚠️ Inactive device buttons
                <Tooltip title="You can't perform actions on inactive devices">
                  <span>
                    <Grid container spacing={2}>
                      {/* Disabled UPDATE */}
                      <Grid item xs={12} sm={6}>
                        <Button variant="contained" color="success" startIcon={<EditIcon />} fullWidth sx={{ borderRadius: 2 }} disabled>
                          UPDATE
                        </Button>
                      </Grid>
 
                      {/* Disabled DELETE */}
                      <Grid item xs={12} sm={6}>
                        <Button variant="contained" color="error" startIcon={<DeleteIcon />} fullWidth sx={{ borderRadius: 2 }} disabled>
                          DELETE
                        </Button>
                      </Grid>
 
                      {/* Disabled ASSIGN OWNER */}
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="contained"
                          startIcon={<PersonAddIcon />}
                          fullWidth
                          sx={{
                            borderRadius: 2,
                            backgroundColor: '#9c27b0',
                            color: '#ffffff',
                          }}
                          disabled
                        >
                          ASSIGN OWNER
                        </Button>
                      </Grid>
 
                      {/* AUDIT LOG */}
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="contained"
                          startIcon={<ListAltIcon />}
                          fullWidth
                          sx={{
                            borderRadius: 2,
                            backgroundColor: '#1976d2',
                            color: '#ffffff',
                            '&:hover': {
                              backgroundColor: '#1565c0',
                            },
                          }}
                          onClick={() => navigate(`/audit-log/${card.deviceId}`)}
                        >
                          AUDIT LOG
                        </Button>
                      </Grid>
 
                      {/* RESTORE */}
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="contained"
                          color="warning"
                          startIcon={<RestoreIcon />}
                          fullWidth
                          sx={{ borderRadius: 2 }}
                          onClick={async () => {
  try {
    await axios.patch(`http://localhost:8083/devices/${card.deviceId}/recover`);
    
    // Refresh the inactive devices list
    await fetchInactiveDevices();

    toast.success("Device restored successfully!");
  } catch (error) {
    console.error("Restore failed:", error);
    toast.error("Failed to restore device.");
  }
}}

                        >
                          RESTORE
                        </Button>
                      </Grid>
                    </Grid>
                  </span>
                </Tooltip>
              ) : (
                // 🟡 Retired device buttons
                <Tooltip title="This device is retired. Actions are restricted.">
                  <span>
                    <Grid container spacing={2}>
                      {/* Disabled UPDATE */}
                      <Grid item xs={12} sm={6}>
                        <Button variant="contained" color="success" startIcon={<EditIcon />} fullWidth sx={{ borderRadius: 2 }} disabled>
                          UPDATE
                        </Button>
                      </Grid>
 
                      {/* Disabled DELETE */}
                      <Grid item xs={12} sm={6}>
                        <Button variant="contained" color="error" startIcon={<DeleteIcon />} fullWidth sx={{ borderRadius: 2 }} disabled>
                          DELETE
                        </Button>
                      </Grid>
 
                      {/* Disabled ASSIGN OWNER */}
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="contained"
                          startIcon={<PersonAddIcon />}
                          fullWidth
                          sx={{
                            borderRadius: 2,
                            backgroundColor: '#9c27b0',
                            color: '#ffffff',
                          }}
                          disabled
                        >
                          ASSIGN OWNER
                        </Button>
                      </Grid>
 
                      {/* AUDIT LOG */}
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="contained"
                          startIcon={<ListAltIcon />}
                          fullWidth
                          sx={{
                            borderRadius: 2,
                            backgroundColor: '#1976d2',
                            color: '#ffffff',
                            '&:hover': {
                              backgroundColor: '#1565c0',
                            },
                          }}
                          onClick={() => navigate(`/audit-log/${card.deviceId}`)}
                        >
                          AUDIT LOG
                        </Button>
                      </Grid>
                    </Grid>
                  </span>
                </Tooltip>
              )}
            </CardActions>
          </Card>
        );
      })}
    </Box>
 
<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 4, gap: 2 }}>
  <Pagination
    count={Math.ceil(finalCards.length / cardsPerPage)}
    page={page}
    onChange={(e, value) => setPage(value)}
    color="primary"
  />
 
</Box>
 
  </>
) : (
  <Box sx={{ textAlign: 'center', mt: 8 }}>
    <Typography variant="h6" color="error" gutterBottom>
      OOPS!! ENTERED DEVICE NOT FOUND
    </Typography>
    <Typography variant="body1" gutterBottom>
      RE-ENTER THE DEVICE ID
    </Typography>
    <Link to="/register-device" style={{ textDecoration: 'none', color: '#1976d2' }}>
      OR REGISTER A NEW DEVICE
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
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 4
      }}
    >
      <Typography variant="h6" mb={2}>Update Device</Typography>
 
      <TextField
        label="Device ID"
        value={selectedDevice?.deviceId || ''}
        fullWidth
        disabled
        sx={{ mb: 2 }}
      />
 
      <TextField
        label="Device Name"
        value={selectedDevice?.name || ''}
        onChange={(e) =>
          setSelectedDevice((prev) => ({ ...prev, name: e.target.value }))
        }
        fullWidth
        required
        sx={{ mb: 2 }}
      />
 
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Type</InputLabel>
        <Select
          value={selectedDevice?.type || ''}
          onChange={(e) =>
            setSelectedDevice((prev) => ({ ...prev, type: e.target.value }))
          }
        >
          <MenuItem value="Laptop">Laptop</MenuItem>
          <MenuItem value="Router">Router</MenuItem>
          <MenuItem value="Smartphone">Smartphone</MenuItem>
          <MenuItem value="Tablet">Tablet</MenuItem>
        </Select>
      </FormControl>
 
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Manufacturer</InputLabel>
        <Select
          value={selectedDevice?.manufacturer || ''}
          onChange={(e) =>
            setSelectedDevice((prev) => ({ ...prev, manufacturer: e.target.value }))
          }
        >
          <MenuItem value="Apple">Apple</MenuItem>
          <MenuItem value="Cisco">Cisco</MenuItem>
          <MenuItem value="Dell">Dell</MenuItem>
          <MenuItem value="Garmin">Garmin</MenuItem>
          <MenuItem value="Samsung">Samsung</MenuItem>
        </Select>
      </FormControl>
 
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={selectedDevice?.status || 'Active'}
          onChange={(e) =>
            setSelectedDevice((prev) => ({ ...prev, status: e.target.value }))
          }
        >
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
          <MenuItem value="Retired">Retire</MenuItem>
        </Select>
      </FormControl>
 
      <TextField
        label="Purchase Date"
        type="date"
        fullWidth
        sx={{ mb: 2 }}
        InputLabelProps={{ shrink: true }}
        inputProps={{ max: new Date().toISOString().split('T')[0] }}
        value={selectedDevice?.purchaseDate || ''}
        onChange={(e) =>
          setSelectedDevice((prev) => ({ ...prev, purchaseDate: e.target.value }))
        }
      />
 
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button variant="contained" color="success" onClick={handleSubmit}>Submit</Button>
              <Button variant="outlined" onClick={() => setShowUpdateModal(false)}>Cancel</Button>
            </Box>
    </Box>
  </Fade>
</Modal>
 
<Modal
  open={showAssignModal}
  onClose={() => setShowAssignModal(false)}
  closeAfterTransition
  BackdropComponent={Backdrop}
  BackdropProps={{ timeout: 500 }}
>
  <Fade in={showAssignModal}>
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
      }}
    >
      <Typography variant="h6" mb={2}>Assign Owner</Typography>
 
      <TextField
        label="Owner ID"
        fullWidth
        sx={{ mb: 2 }}
        value={ownerId}
        onChange={(e) => setOwnerId(e.target.value)}
      />
 
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={async () => {
            if (selectedDevice?.deviceId && ownerId.trim()) {
              try {
                await axios.patch(
                  `http://localhost:8083/devices/${selectedDevice.deviceId}/assign-owner`,
                  null,
                  { params: { ownerID: ownerId } }
                );
 
                // Update local state
                setCards(prev =>
                  prev.map(card =>
                    card.deviceId === selectedDevice.deviceId
                      ? { ...card, owner: ownerId }
                      : card
                  )
                );
 
                setShowAssignModal(false);
                setOwnerId('');
                toast.success("Owner assigned successfully!");
              } catch (error) {
                console.error("Owner assignment failed:", error);
              }
            }
          }}
        >
          Assign
        </Button>
 
        <Button variant="outlined" onClick={() => setShowAssignModal(false)}>
          Cancel
        </Button>
      </Box>
    </Box>
  </Fade>
</Modal>
 
{/* Delete Device Modal */}
<Modal
  open={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  closeAfterTransition
  BackdropComponent={Backdrop}
  BackdropProps={{ timeout: 500 }}
>
  <Fade in={showDeleteModal}>
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
      }}
    >
      <Typography variant="h6" mb={2}>Confirm Device Deletion</Typography>
      <Typography variant="body1" mb={3}>
        {selectedDevice
          ? <>Are you sure you want to delete device <strong>{selectedDevice.name}</strong> (ID: {selectedDevice.deviceId})?</>
          : "No device selected for deletion."}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button variant="contained" color="error" disabled={!selectedDevice} onClick={handleDeleteDevice} onClose={() => setShowDeleteModal(false)}>Delete</Button>
         <Button variant="outlined" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            </Box>
    </Box>
  </Fade>
</Modal>
    </Box>
  );
};
 
export default ShowDevices;