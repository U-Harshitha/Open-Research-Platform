import { useParams } from "react-router-dom";
import { Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { fetchResearchPapers } from "../api";

const ResearchDetails = () => {
  const { id } = useParams();
  const [paper, setPaper] = useState(null);

  useEffect(() => {
    fetchResearchPapers().then((papers) => {
      const foundPaper = papers.find((p) => p.id.toString() === id);
      setPaper(foundPaper);
    });
  }, [id]);

  if (!paper) return <Typography>Loading...</Typography>;

  return (
    <Container>
      <Typography variant="h4">{paper.title}</Typography>
      <Typography variant="body1">{paper.content}</Typography>
    </Container>
  );
};

export default ResearchDetails;
