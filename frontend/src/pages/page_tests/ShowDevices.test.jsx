import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShowDevices from './ShowDevices';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

jest.mock('axios');

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

const devices = {
  active: {
    device: {
      deviceID: 'DEV001',
      name: 'MacBook Pro',
      type: 'Laptop',
      manufacturer: 'Apple',
      purchaseDate: '2023-01-15',
      createdOn: '2023-01-16',
      deletedOn: null,
      ownerID: 'OWNER001',
    },
  },
  inactive: {
    device: {
      deviceID: 'DEV002',
      name: 'Dell XPS',
      type: 'Laptop',
      manufacturer: 'Dell',
      purchaseDate: '2023-02-10',
      createdOn: '2023-02-11',
      deletedOn: '2024-01-01',
      ownerID: null,
    },
  },
  router: {
    device: {
      deviceID: 'DEV003',
      name: 'Cisco Router',
      type: 'Router',
      manufacturer: 'Cisco',
      purchaseDate: '2023-03-05',
      createdOn: '2023-03-06',
      deletedOn: null,
      ownerID: null,
    },
  },
};

describe('ShowDevices Component', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders active device card', async () => {
    axios.get.mockResolvedValueOnce({ data: [devices.active] });
    renderWithRouter(<ShowDevices />);
    expect(await screen.findByText(/MacBook Pro/i)).toBeInTheDocument();
    expect(screen.getByText(/DEV001/i)).toBeInTheDocument();
  });

  it('opens update modal and submits updated data', async () => {
    axios.get.mockResolvedValueOnce({ data: [devices.active] });
    axios.patch.mockResolvedValueOnce({
      data: { device: devices.active.device },
    });

    renderWithRouter(<ShowDevices />);
    fireEvent.click(await screen.findByRole('button', { name: /update/i }));

    expect(await screen.findByText(/Update Device/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Device Name/i), {
      target: { value: 'Updated Name' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/DEVICE DETAILS/i)
      ).toBeInTheDocument()
    );
  });

  it('opens delete modal and confirms deletion', async () => {
    axios.get.mockResolvedValueOnce({ data: [devices.active] });
    axios.delete.mockResolvedValueOnce({});

    renderWithRouter(<ShowDevices />);
    fireEvent.click(await screen.findByRole('button', { name: /delete/i }));
    expect(
      await screen.findByText(/Confirm Device Deletion/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Delete$/i }));
    await waitFor(() =>
      expect(screen.getByText(/DEVICE DETAILS/i)).toBeInTheDocument()
    );
  });

  it('opens assign modal and assigns owner', async () => {
    axios.get.mockResolvedValueOnce({ data: [devices.active] });
    axios.patch.mockResolvedValueOnce({});

    renderWithRouter(<ShowDevices />);
    fireEvent.click(await screen.findByRole('button', { name: /assign owner/i }));

    // Wait for owner field to appear (inside modal)
    await waitFor(() =>
      expect(screen.getByLabelText(/Owner ID/i)).toBeInTheDocument()
    );

    fireEvent.change(screen.getByLabelText(/Owner ID/i), {
      target: { value: 'NEW_OWNER' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^Assign$/i }));

    await waitFor(() =>
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/assign-owner'),
        null,
        expect.objectContaining({ params: { ownerID: 'NEW_OWNER' } })
      )
    );
  });

  it('renders inactive device and disables action buttons', async () => {
    axios.get.mockResolvedValueOnce({ data: [devices.inactive] });
    renderWithRouter(<ShowDevices />);

    const inactiveTab = await screen.findByRole('button', { name: /inactive/i });
    fireEvent.click(inactiveTab);

    expect(await screen.findByText(/Dell XPS/i)).toBeInTheDocument();

    ['update', 'delete', 'assign owner'].forEach((action) => {
      const btn = screen.getByRole('button', { name: new RegExp(action, 'i') });
      expect(btn).toBeDisabled();
    });
  });


});
