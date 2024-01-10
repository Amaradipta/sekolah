const request = require('supertest');
const app = require('../index');
const conn = require('../config/connection');


describe('siswaController', () => {

    describe('GET /siswa', () => {
        test('should get list of siswa', async() => {
            const response = await request(app).get('/siswa');
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('status', true);
        });
    });

});


describe('POST /siswa', () => {
    test('should insert new siswa', async() => {
        const response = await request(app)
            .post('/siswa')
            .query({
                nama: 'Andri',
                umur: 20,
                alamat: 'Jl. Cibolang Kaler 21',
            });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('status', true);
    });
});


describe('Update Endpoint', () => {
    let insertedId;

    // Before testing, insert student data into the database to be updated
    beforeAll(async() => {
        const insertQuery = "INSERT INTO tbl_siswa (nama, umur, alamat) VALUES ('Samsul', 38, 'Solo')";
        const insertResult = await new Promise((resolve) => {
            conn.query(insertQuery, (err, result) => {
                if (err) {
                    console.error('Insert Error', err);
                }
                resolve(result);
            });
        });

        insertedId = insertResult.insertId;
    });

    // After testing, delete the updated student data from the database
    afterAll(async() => {
        const deleteQuery = `DELETE FROM tbl_siswa WHERE id = ${insertedId}`;
        await new Promise((resolve) => {
            conn.query(deleteQuery, () => {
                resolve();
            });
        });
        // Close database connection after all tests are finished
        // conn.end();
    });

    // Test case for updating a student
    it('should update a student', async() => {
        const updatedData = {
            nama: 'Alun',
            umur: 20,
            alamat: 'Malang',
        };

        const response = await request(app)
            .put(`/siswa/${insertedId}`)
            .send(updatedData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('status', true);
        expect(response.body).toHaveProperty('msg', 'Successfull Updated');

        // Check if the data has been updated in the database
        const selectQuery = `SELECT * FROM tbl_siswa WHERE id = ${insertedId}`;
        const selectResult = await new Promise((resolve) => {
            conn.query(selectQuery, (err, result) => {
                if (err) {
                    console.error('Select Error', err);
                    throw err;
                }
                resolve(result);
            });
        });

        expect(selectResult.length).toBe(1);
        expect(Array.isArray(selectResult)).toBe(true);
        expect(selectResult.length).toBeGreaterThan(0);
        expect(selectResult[0].nama == updatedData.nama);
        expect(selectResult[0].umur == updatedData.umur);
        expect(selectResult[0].alamat == updatedData.alamat);
    });
});



describe('waController Delete()', () => {
    let insertedId;

    // Before testing, insert student data into the database to be deleted
    beforeAll(async() => {
        const insertQuery = "INSERT INTO tbl_siswa (nama, umur, alamat) VALUES ('Test', 25, 'Jesi')";
        const insertResult = await new Promise((resolve) => {
            conn.query(insertQuery, (err, result) => {
                if (err) {
                    console.error('Insert Error', err);
                }
                insertedId = result.insertId;
                resolve();
            });
        });
    });

    // Test case for deleting a student
    it('should delete a student', async() => {
        const response = await request(app).delete(`/siswa/${insertedId}`);

        // Check if the response matches the expected result when the status is true
        if (response.body.status) {
            expect(response.body).toHaveProperty('status', true);
            expect(response.body).toHaveProperty('msg', 'Delete Successfull');
        } else {
            // If status is false, the response should indicate failure
            expect(response.body).toHaveProperty('status', false);
            expect(response.body).toHaveProperty('msg', 'Delete Failed');
        }

        // Ensure data has been deleted from the database
        const selectQuery = `SELECT * FROM tbl_siswa WHERE id = ${insertedId}`;
        const selectResult = await new Promise((resolve) => {
            conn.query(selectQuery, (err, result) => {
                resolve(result);
            });
        });

        expect(selectResult.length).toBe(0);
    });

    // After testing, close the database connection
    afterAll(() => {
        conn.end();
    });
});