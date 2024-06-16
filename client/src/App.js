import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UniversityPage from './components/UniversityPage';
import StudentsPage from './components/StudentsPage';
import CompaniesPage from './components/CompaniesPage';
import Unifront from './components/Unifront';
import { Layout, Row, Col, Button } from 'antd';

const { Content } = Layout;

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Layout>
          <Content style={{ padding: '20px' }}>
            <Row justify="center">
              <Col>
                <Button type="primary" size="large">
                  <Link to="/university">University</Link>
                </Button>
              </Col>
              <Col style={{ marginLeft: '10px', marginRight: '10px' }}>
                <Button type="primary" size="large">
                  <Link to="/students">Students</Link>
                </Button>
              </Col>
              <Col>
                <Button type="primary" size="large">
                  <Link to="/companies">Companies</Link>
                </Button>
              </Col>
            </Row>
            <Routes>
              <Route path="/university" element={<UniversityPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/companies" element={<CompaniesPage />} />
              <Route path="/unifront" element={<Unifront />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;
