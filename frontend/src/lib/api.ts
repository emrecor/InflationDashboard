import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const fetchCategories = async (): Promise<string[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/categories`);
        return response.data;
    } catch (error) {
        console.error("Error fetching categories", error);
        return [];
    }
};

export const fetchInflationData = async (category: string, timeRange: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/inflation-data`, {
            params: { category, time_range: timeRange }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching inflation data", error);
        return { chartData: [], tableData: [] };
    }
};
