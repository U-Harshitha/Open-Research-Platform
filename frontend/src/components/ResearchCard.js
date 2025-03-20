import { Card, CardContent, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const ResearchCard = ({ paper }) => {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardContent>
        <Typography variant="h6">{paper.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {paper.summary}
        </Typography>
        <Button size="small" component={Link} to={`/research/${paper.id}`}>
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default ResearchCard;
