import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import {
  Button,
  Col,
  Container,
  Form,
  FormControl,
  Row,
  Table,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

// Component for displaying student details
const StudentDetail = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axios.get(
          `https://student-api-nestjs.onrender.com/students/${id}`
        );
        setStudent(response.data);
      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    };

    fetchStudent();
  }, [id]);

  if (!student) return <div>Loading...</div>;

  return (
    <Container className="mt-5">
      <h2>Student Detail</h2>
      <p>
        <strong>Name:</strong> {student.name}
      </p>
      <p>
        <strong>Code:</strong> {student.code}
      </p>
      <p>
        <strong>Status:</strong> {student.active ? "Active" : "Inactive"}
      </p>
    </Container>
  );
};

function App() {
  const [students, setStudents] = useState([]); // Initialize as an empty array
  const [newStudent, setNewStudent] = useState({
    name: "",
    code: "",
    active: false,
  });
  const [selectedCount, setSelectedCount] = useState(0);
  const navigate = useNavigate();

  // Fetch students from the API
  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        "https://student-api-nestjs.onrender.com/students"
      );
      setStudents(response.data); // Set students data
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]); // Reset to empty array on error
    }
  };

  // Add new student via API
  const handleAddStudent = async () => {
    if (newStudent.name && newStudent.code) {
      try {
        await axios.post("https://student-api-nestjs.onrender.com/students", {
          studentCode: newStudent.code,
          name: newStudent.name,
          isActive: newStudent.active,
        });
        fetchStudents(); // Refresh the list
        setNewStudent({ name: "", code: "", active: false }); // Reset form
      } catch (error) {
        console.error("Error adding student:", error);
      }
    }
  };

  // Delete a student via API
  const handleDeleteStudent = async (id) => {
    try {
      await axios.delete(
        `https://student-api-nestjs.onrender.com/students/${id}`
      );
      fetchStudents(); // Refresh the list
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  // Clear all students and reset selected count
  const handleClearStudents = () => {
    setStudents([]);
    setSelectedCount(0);
  };

  // Handle checkbox selection to update selected count
  const handleSelectStudent = (checked) => {
    setSelectedCount(checked ? selectedCount + 1 : selectedCount - 1);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <Container className="mt-5">
      {/* Header with total selected students and clear button */}
      <Row>
        <Col>
          <h2>Total Selected Student: {selectedCount}</h2>
        </Col>
        <Col>
          <Button variant="primary" onClick={handleClearStudents}>
            Clear
          </Button>
        </Col>
      </Row>

      {/* Form to add a new student */}
      <Row className="mt-5">
        <Col>
          <FormControl
            placeholder="Student Name"
            value={newStudent.name}
            onChange={(e) =>
              setNewStudent({ ...newStudent, name: e.target.value })
            }
          />
          <FormControl
            className="mt-2"
            placeholder="Student Code"
            value={newStudent.code}
            onChange={(e) =>
              setNewStudent({ ...newStudent, code: e.target.value })
            }
          />
          <Form.Check
            className="mt-2"
            type="checkbox"
            label={"Still Active"}
            checked={newStudent.active}
            onChange={(e) =>
              setNewStudent({ ...newStudent, active: e.target.checked })
            }
          />
        </Col>
        <Col>
          <Button variant="primary" onClick={handleAddStudent}>
            Add
          </Button>
        </Col>
      </Row>

      {/* Table to display the list of students */}
      <Row className="mt-5">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Select</th>
              <th>Student Name</th>
              <th>Student Code</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? ( // Check if students array is not empty
              students.map((student) => (
                <tr key={student.id}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      onChange={(e) => handleSelectStudent(e.target.checked)}
                    />
                  </td>
                  <td>
                    <Link
                      to={`/student/${student.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      {student.name}
                    </Link>
                  </td>
                  <td>{student.code}</td>
                  <td>
                    <Button variant={student.active ? "info" : "danger"}>
                      {student.active ? "Active" : "Inactive"}
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteStudent(student.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Row>

      {/* Define routes for the application */}
      <Routes>
        <Route path="/student/:id" element={<StudentDetail />} />
      </Routes>
    </Container>
  );
}

// Wrap the App component in a Router
export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
