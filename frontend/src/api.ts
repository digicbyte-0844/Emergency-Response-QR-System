import axios from 'axios';
import { MedicalProfile, PublicEmergencyProfile, HospitalFacility, LocationAlertResponse, ProxyCallResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  async getHealth() {
    const res = await client.get('/api/health');
    return res.data;
  },

  async getDemoProfiles(): Promise<{ id: string; fullName: string; bloodType: string; allergies: string[]; chronicConditions: string[]; token: string }[]> {
    const res = await client.get('/api/profiles/demo');
    return res.data.demos;
  },

  async createProfile(data: MedicalProfile): Promise<{ success: boolean; token: string; profile: MedicalProfile; scanUrl: string }> {
    const res = await client.post('/api/profile', data);
    return res.data;
  },

  async updateProfile(token: string, data: Partial<MedicalProfile>): Promise<{ success: boolean; profile: MedicalProfile }> {
    const res = await client.put(`/api/profile/${token}`, data);
    return res.data;
  },

  async getScanProfile(token: string): Promise<PublicEmergencyProfile> {
    const res = await client.get(`/api/scan/${token}`);
    return res.data;
  },

  async verifyPin(
    token: string,
    payload: { pin?: string; override?: boolean; reason?: string }
  ): Promise<{ success: boolean; profile: PublicEmergencyProfile }> {
    const res = await client.post(`/api/scan/${token}/verify-pin`, payload);
    return res.data;
  },

  async notifyLocation(
    token: string,
    payload: { latitude: number; longitude: number; accuracy?: number; bystanderNote?: string }
  ): Promise<LocationAlertResponse> {
    const res = await client.post(`/api/scan/${token}/notify-location`, payload);
    return res.data;
  },

  async callEmergencyContact(token: string, contactId?: string): Promise<ProxyCallResponse> {
    const res = await client.post(`/api/scan/${token}/call-contact`, { contactId });
    return res.data;
  },

  async getNearbyHospitals(lat: number, lng: number, radius = 7500): Promise<HospitalFacility[]> {
    const res = await client.get('/api/hospitals', {
      params: { lat, lng, radius },
    });
    return res.data.facilities;
  },
};
