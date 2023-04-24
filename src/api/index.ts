import axios from 'axios';
// import { useUserStore } from '@/stores';

interface Config {
  baseURL: string;
  params?: any;
}

const API = () => {
  const config: Config = {
    baseURL: '/',
  };

  return axios.create(config);
};

export default API;
