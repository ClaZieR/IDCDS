// Navigation.js
import React from 'react';
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/university">For University</Link>
        </li>
        <li>
          <Link to="/students">For Students</Link>
        </li>
        <li>
          <Link to="/companies">For Companies</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
