import React, { useState, useEffect } from "react";
import api, { getUserRole } from "../api/api";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";

const ProjectAnalysis = () => {
  const [analysisData, setAnalysisData] = useState([]);
  const [open, setOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
  }, []);

  const fetchAnalysis = async () => {
    try {
      const { data } = await api.get("/projects/analysis");
      setAnalysisData(data);
      setOpen(true);
    } catch (error) {
      console.error("Error fetching project analysis:", error);
      alert("Failed to fetch project analysis.");
    }
  };
  

  if (userRole !== "Admin" && userRole !== "Manager") return (
    <Typography gutterBottom style={{ fontSize: '3rem' }}>
      Projects
    </Typography>
  );

  return (
    <>
      <Button variant="contained" color="primary" onClick={fetchAnalysis}>
        View Project Analysis
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>Project Analysis</DialogTitle>
        <DialogContent>
          {analysisData.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Completion Rate (%)</TableCell>
                    <TableCell>Overdue Tasks</TableCell>
                    <TableCell>Total Resources</TableCell>
                    <TableCell>Resource Quantity</TableCell>
                    <TableCell>Total Resource Cost ($)</TableCell>
                    <TableCell>Top Team Member</TableCell>
                    <TableCell>Tasks Assigned (Top Member)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analysisData.map((project) => (
                    <TableRow key={project.project_id}>
                      <TableCell>{project.project_name}</TableCell>
                      <TableCell>{project.project_status}</TableCell>
                      <TableCell>{project.completion_rate}</TableCell>
                      <TableCell>{project.overdue_tasks}</TableCell>
                      <TableCell>{project.total_resources}</TableCell>
                      <TableCell>{project.total_resource_quantity}</TableCell>
                      <TableCell>{project.total_resource_cost}</TableCell>
                      <TableCell>
                        {project.top_team_member || "No Team Member Assigned"}
                      </TableCell>
                      <TableCell>
                        {project.top_team_member_tasks || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No analysis data available.</Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectAnalysis;

