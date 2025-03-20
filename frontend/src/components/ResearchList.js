import { Grid } from "@mui/material";
import ResearchCard from "./ResearchCard";
import { useEffect, useState } from "react";
import { fetchResearchPapers } from "../api";

const ResearchList = () => {
  const [papers, setPapers] = useState([]);

  useEffect(() => {
    fetchResearchPapers().then(setPapers);
  }, []);

  return (
    <Grid container spacing={3}>
      {papers.map((paper) => (
        <Grid item xs={12} sm={6} md={4} key={paper.id}>
          <ResearchCard paper={paper} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ResearchList;
