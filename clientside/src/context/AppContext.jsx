import { createContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [backendError, setBackendError] = useState(null);

  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : false
  );
  const [selectedCity, setSelectedCity] = useState(
    localStorage.getItem("selectedCity") || ""
  );
  const [userData, setUserData] = useState(false);

  const api = useMemo(() => {
    if (!backendUrl) return null;
    return axios.create({ baseURL: backendUrl, timeout: 10000 });
  }, [backendUrl]);

  useEffect(() => {
    if (!backendUrl) {
      setBackendError("Missing backend URL. Set VITE_BACKEND_URL in your environment.");
      toast.error("Backend URL missing. Please set VITE_BACKEND_URL.");
    } else {
      setBackendError(null);
    }
  }, [backendUrl]);

  useEffect(() => {
    if (!api) return;
    const reqId = api.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    const resId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        if (status === 401) {
          toast.error("Session expired. Please log in again.");
          setToken(false);
          localStorage.removeItem("token");
          setUserData(false);
        } else {
          const message = error?.response?.data?.message || error.message;
          toast.error(message);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(reqId);
      api.interceptors.response.eject(resId);
    };
  }, [api, token]);

  const getDoctorsData = async (cityOverride) => {
    if (!api) {
      if (backendError) toast.error(backendError);
      return;
    }
    try {
      const cityParam = cityOverride ?? selectedCity;
      const { data } = await api.get("/api/doctor/list", {
        params: cityParam ? { city: cityParam } : {},
      });
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const loadUserProfileData = async () => {
    if (!api) {
      if (backendError) toast.error(backendError);
      return;
    }
    try {
      const { data } = await api.get("/api/user/get-profile");
      if (data.success) {
        setUserData(data.user);
        if (!selectedCity && data.user?.city) {
          setSelectedCity(data.user.city);
          localStorage.setItem("selectedCity", data.user.city);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const value = {
    doctors,
    getDoctorsData,
    currencySymbol,
    token,
    setToken,
    backendUrl,
    backendError,
    api,
    selectedCity,
    setSelectedCity,
    userData,
    setUserData,
    loadUserProfileData,
  };

  useEffect(() => {
    localStorage.setItem("selectedCity", selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      loadUserProfileData();
    } else {
      setUserData(false);
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (!backendUrl) return;
    getDoctorsData();
  }, [selectedCity, backendUrl]);

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
