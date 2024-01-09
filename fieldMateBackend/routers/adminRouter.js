import express from 'express';
import postgresClient from '../config/db.js';

const router = express.Router();

router.post('/report', async (req, res) => {
  try {
    const {selectedMessage, reporter, reason} = req.body;

    const insertReportQuery = `
        INSERT INTO reports (report_id, reporter_username, reported_username, reasons, reported_message)
        VALUES (DEFAULT, $1, $2, $3, $4)
        RETURNING *;
      `;

    const result = await postgresClient.query(insertReportQuery, [
      reporter,
      selectedMessage.sender,
      reason,
      selectedMessage.text,
    ]);

    const newReport = result.rows[0];

    console.log('Report sent successfully:', newReport);

    res.status(200).json({message: 'Report sent successfully', newReport});
  } catch (error) {
    console.error('Error sending report:', error);
    res.status(500).json({message: 'Error sending report'});
  }
});

router.get('/get-reports', async (req, res) => {
  try {
    const getReportsQuery = 'SELECT * FROM reports';
    const result = await postgresClient.query(getReportsQuery);

    const reports = result.rows;
    res.status(200).json({reports});
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({message: 'Error fetching reports'});
  }
});
router.delete('/ban-user/:reportId', async (req, res) => {
  try {
    const reportId = req.params.reportId;

    const updateIsBannedQuery = `
        UPDATE reports
        SET is_banned = 1
        WHERE report_id = $1
        RETURNING reported_username;
      `;
    const updateResult = await postgresClient.query(updateIsBannedQuery, [
      reportId,
    ]);

    if (updateResult.rowCount > 0) {
      const reportedUsername = updateResult.rows[0].reported_username;

      const updateUserIsBannedQuery = `
          UPDATE users
          SET is_banned = 1
          WHERE username = $1;
        `;
      await postgresClient.query(updateUserIsBannedQuery, [reportedUsername]);

      res.status(200).json({
        message: 'User banned and report deleted successfully.',
        reportedUsername: reportedUsername,
      });
    } else {
      res.status(404).json({message: 'Report not found'});
    }
  } catch (error) {
    console.error('Error banning user and deleting report:', error);
    res.status(500).json({
      message: 'Error banning user and deleting report',
    });
  }
});
router.delete('/delete-report/:reportId', async (req, res) => {
  try {
    const reportId = req.params.reportId;

    const deleteReportQuery = 'DELETE FROM reports WHERE report_id = $1';
    const result = await postgresClient.query(deleteReportQuery, [reportId]);

    if (result.rowCount > 0) {
      res.status(200).json({message: 'Report deleted successfully'});
    } else {
      res.status(404).json({message: 'Report not found'});
    }
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({message: 'Error deleting report'});
  }
});
router.put('/remove-ban/:reportId', async (req, res) => {
  try {
    const reportId = req.params.reportId;

    const updateIsBannedQuery = `
        UPDATE reports
        SET is_banned = 0
        WHERE report_id = $1
        RETURNING reported_username;
      `;

    const updateResult = await postgresClient.query(updateIsBannedQuery, [
      reportId,
    ]);

    if (updateResult.rowCount > 0) {
      const reportedUsername = updateResult.rows[0].reported_username;

      const updateUserIsBannedQuery = `
          UPDATE users
          SET is_banned = 0
          WHERE username = $1;
        `;
      await postgresClient.query(updateUserIsBannedQuery, [reportedUsername]);

      const deleteReportQuery = 'DELETE FROM reports WHERE report_id = $1';
      await postgresClient.query(deleteReportQuery, [reportId]);

      res.status(200).json({
        message: 'Ban removed and report deleted successfully.',
        reportedUsername: reportedUsername,
      });
    } else {
      res.status(404).json({message: 'Report not found'});
    }
  } catch (error) {
    console.error('Error removing ban and deleting report:', error);
    res.status(500).json({
      message: 'Error removing ban and deleting report',
    });
  }
});
export default router;
