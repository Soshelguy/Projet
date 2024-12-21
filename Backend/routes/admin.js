// routes/admin.js

const express = require('express');
const router = express.Router();
const pool = require('../db'); // PostgreSQL pool

// Approve user application
router.post('/approve-application', async (req, res) => {
  const { userId, applicationType } = req.body; // Get userId and applicationType from request body

  try {
    let roleName;
    let statusField;

    // Determine role name and status field based on application type
    switch (applicationType) {
      case 'SERVICE_PROVIDER':
        roleName = 'SERVICE_PROVIDER';
        statusField = 'service_provider_request';
        break;
      case 'DELIVERER':
        roleName = 'DELIVERER';
        statusField = 'deliverer_application_status';
        break;
      case 'CATERING_BUSINESS':
        roleName = 'CATERING_BUSINESS';
        statusField = 'catering_business_request';
        break;
      default:
        return res.status(400).json({ error: 'Invalid application type' });
    }

    // Update the user's application status
    await pool.query(
      `UPDATE users SET ${statusField} = $1 WHERE id = $2`,
      ['APPROVED', userId]
    );

    // Get the role ID from the roles table
    const roleResult = await pool.query(
      'SELECT id FROM roles WHERE name = $1',
      [roleName]
    );

    if (roleResult.rowCount === 0) {
      return res.status(400).json({ error: 'Role not found' });
    }

    const roleId = roleResult.rows[0].id;

    // Insert into user_roles table
    await pool.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, roleId]
    );

    res.status(200).json({ message: `User approved and role ${roleName} assigned` });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'An error occurred while updating user role' });
  }
});

module.exports = router;