import express from 'express';
import postgresClient from '../config/db.js';
import {v4 as uuidv4} from 'uuid';

const fieldRouter = express.Router();

fieldRouter.post('/add-field', async (req, res) => {
  try {
    const {name, location, openHours, selectedDate, fieldOwnerId} = req.body;

    const dateObject = new Date(selectedDate);

    const formattedDateString = dateObject.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const checkFieldQuery =
      'SELECT * FROM fields WHERE name = $1 AND date = $2';
    const checkResult = await postgresClient.query(checkFieldQuery, [
      name,
      formattedDateString,
    ]);

    if (checkResult.rows.length > 0) {
      res.status(400).json({
        message: 'Field with the same name and date already exists',
      });
      return;
    }

    const addFieldQuery =
      'INSERT INTO fields (field_id, name, location, open_hours, date, field_owner_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';

    const result = await postgresClient.query(addFieldQuery, [
      uuidv4(),
      name,
      location,
      openHours,
      formattedDateString,
      fieldOwnerId,
    ]);

    res.status(201).json({
      message: 'Field added successfully',
      field: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Internal server error'});
  }
});
fieldRouter.delete('/delete-field/:fieldId', async (req, res) => {
  const client = await postgresClient.connect();
  try {
    await client.query('BEGIN');

    const {fieldId} = req.params;

    const deleteReservationsQuery =
      'DELETE FROM reservations WHERE field_id = $1 RETURNING *';
    const reservationsResult = await client.query(deleteReservationsQuery, [
      fieldId,
    ]);

    const deleteFieldQuery =
      'DELETE FROM fields WHERE field_id = $1 RETURNING *';
    const fieldResult = await client.query(deleteFieldQuery, [fieldId]);

    if (fieldResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({message: 'Field not found'});
    }

    await client.query('COMMIT');

    res.status(200).json({
      message: 'Field deleted successfully',
      deletedField: fieldResult.rows[0],
      deletedReservations: reservationsResult.rows,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res
      .status(500)
      .json({message: 'Failed to delete field and related reservations'});
  } finally {
    client.release();
  }
});

fieldRouter.put('/add-hour/:fieldId', async (req, res) => {
  try {
    const {fieldId} = req.params;
    const {newHours} = req.body;

    const addHourQuery =
      'UPDATE fields SET open_hours = open_hours || $1 WHERE field_id = $2 RETURNING *';

    const result = await postgresClient.query(addHourQuery, [
      newHours,
      fieldId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({message: 'Field not found'});
    }

    res
      .status(200)
      .json({message: 'Hours added successfully', field: result.rows[0]});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to add hours to field'});
  }
});

fieldRouter.put('/remove-hour/:fieldId', async (req, res) => {
  try {
    const {fieldId} = req.params;
    const {hourToRemove} = req.body;

    const removeHourQuery =
      'UPDATE fields SET open_hours = array_remove(open_hours, $1) WHERE field_id = $2 RETURNING *';
    const result = await postgresClient.query(removeHourQuery, [
      hourToRemove,
      fieldId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({message: 'Field not found'});
    }

    res
      .status(200)
      .json({message: 'Hour removed successfully', field: result.rows[0]});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to remove hour from field'});
  }
});

fieldRouter.post('/reserve-field', async (req, res) => {
  try {
    const {fieldId, userId, reservedHour, reservedDate} = req.body;
    const reserveFieldQuery =
      'INSERT INTO reservations (reservation_id, field_id, user_id, reserved_hour, reserved_date) VALUES ($1, $2, $3, $4, $5) RETURNING *';

    const reservationResult = await postgresClient.query(reserveFieldQuery, [
      uuidv4(),
      fieldId,
      userId,
      reservedHour,
      reservedDate,
    ]);

    const updateFieldQuery =
      'UPDATE fields SET open_hours = array_remove(open_hours, $1) WHERE field_id = $2';
    await postgresClient.query(updateFieldQuery, [reservedHour, fieldId]);

    res.status(201).json({
      message: 'Field reserved successfully',
      reservation: reservationResult.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to reserve field'});
  }
});

fieldRouter.get('/get-field/:fieldId', async (req, res) => {
  try {
    const {fieldId} = req.params;

    const getFieldQuery = 'SELECT * FROM fields WHERE field_id = $1';
    const result = await postgresClient.query(getFieldQuery, [fieldId]);

    if (result.rows.length === 0) {
      return res.status(404).json({message: 'Field not found'});
    }

    res.status(200).json({field: result.rows[0]});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to get field information'});
  }
});
fieldRouter.get('/get-fields-by-owner/:fieldOwnerId', async (req, res) => {
  try {
    const {fieldOwnerId} = req.params;

    const getFieldsByOwnerQuery =
      'SELECT * FROM fields WHERE field_owner_id = $1';
    const result = await postgresClient.query(getFieldsByOwnerQuery, [
      fieldOwnerId,
    ]);

    res.status(200).json({fields: result.rows});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to get fields by owner'});
  }
});

fieldRouter.get('/get-all-fields', async (req, res) => {
  try {
    const getAllFieldsQuery = 'SELECT * FROM fields';
    const result = await postgresClient.query(getAllFieldsQuery);

    res.status(200).json({fields: result.rows});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to get all fields'});
  }
});
fieldRouter.get('/get-all-reservations', async (req, res) => {
  try {
    const getAllReservationsQuery = `
    SELECT reservations.*, fields.name AS field_name, users.username
    FROM reservations
    INNER JOIN fields ON reservations.field_id = fields.field_id
    INNER JOIN users ON reservations.user_id = users.user_id;
  `;
    const result = await postgresClient.query(getAllReservationsQuery);

    res.status(200).json({reservations: result.rows});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to get all reservations'});
  }
});
fieldRouter.delete('/cancel-reservation/:reservationId', async (req, res) => {
  try {
    const {reservationId} = req.params;

    const getReservationQuery =
      'SELECT * FROM reservations WHERE reservation_id = $1';
    const reservationResult = await postgresClient.query(getReservationQuery, [
      reservationId,
    ]);

    if (reservationResult.rows.length === 0) {
      return res.status(404).json({message: 'Reservation not found'});
    }

    const reservation = reservationResult.rows[0];

    const deleteReservationQuery =
      'DELETE FROM reservations WHERE reservation_id = $1';
    await postgresClient.query(deleteReservationQuery, [reservationId]);

    const updateFieldQuery =
      'UPDATE fields SET open_hours = array_append(open_hours, $1) WHERE field_id = $2';
    await postgresClient.query(updateFieldQuery, [
      reservation.reserved_hour,
      reservation.field_id,
    ]);

    res.status(200).json({message: 'Reservation canceled successfully'});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Failed to cancel reservation'});
  }
});

export default fieldRouter;
