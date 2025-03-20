import axios from "axios";

const API_URL = "http://localhost:3000"; 

export const fetchResearchPapers = async () => {
  try {
    const response = await axios.get(`${API_URL}/research_papers`);
    return response.data;
  } catch (error) {
    console.error("Error fetching research papers:", error);
    return [];
  }
};
