let express = require('express');
let app = express();
let port = 3000;
let bodyParser = require('body-parser');

const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    port: 8889,
    connectionLimit: 4
});

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
let jsonParser = bodyParser.json();

const options = {
    swaggerDefinition: {
        info: {
            title: 'System Integration Week-6 quiz-08',
            version: '1.0.0',
            description: 'working with swagger using REST api'
        },
        host: '137.184.41.42:3000',
        basePath: '/',
    },
    apis: ['./server.js'],
};

const specs = swaggerJsdoc(options);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

/**
 * @swagger
 * /customers:
 *      get:
 *          description:
 *              to gets the details of all customers
 *          produces:
 *              -application/json
 *          responses:
 *              200:    
 *                  description: array of all customers
 */
app.get('/customers', function (req, resp) {  
    pool.query('select * FROM sample.customer')
        .then(res => {
            resp.statusCode = 200;
            resp.setHeader('Content-Type', 'Application/json');
            resp.send(res);
        })
        .catch(err => console.error('Error', err.stack));
});

/**
 * @swagger
 * /student:
 *      get:
 *          description:
 *              to gets the details of all students
 *          produces:
 *              -application/json
 *          responses:
 *              200:    
 *                  description: array of all students
 */
app.get('/student', function (req, resp) {
    pool.query('select * FROM sample.student')
        .then(res => {
            resp.statusCode = 200;
            resp.setHeader('Content-Type', 'Application/json');
            resp.send(res);
        })
        .catch(err => console.error('Error', err.stack));
});

/**
 * @swagger
 * /foods:
 *      get:
 *          description:
 *              to gets the details of all food items
 *          produces:
 *              -application/json
 *          responses:
 *              200:    
 *                  description: array of all food items.
*/
app.get('/foods', function (req, resp) {
    console.log(req.body)
    pool.query('select * FROM sample.foods')
        .then(res => {
            resp.statusCode = 200;
            resp.setHeader('Content-Type', 'Application/json');
            resp.send(res);
        })
        .catch(err => console.error('Error', err.stack));
});


/**
 * @swagger
 * definitions:
 *      student:
 *          properties:
 *              name:
 *                  type: string
 *              rollId:
 *                  type: integer
 *              title:
 *                  type: string
 *              class:
 *                  tyepe: string
 *              section:
 *                  tyepe: string
 */

/**
 * @swagger
 * /student:
 *  post:
 *      description: to creates a new Student
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: student
 *            description: student object
 *            in: body
 *            required: true
 *            schema:
 *              $ref: '#/definitions/student'
 *      responses:
 *          200:
 *              description: Successfull
 */
app.post('/student', jsonParser, (req, resp) => {

    const student = req.body;
    console.log(student);
    if (!student.rollId || typeof (student.rollId) !== 'number' || !student.name || !student.title || !student.class || !student.section ) {
        console.log("error");
        resp.statusCode = 400;
        resp.send({ error: "Bad Request" });
    }
    else {
        pool.query(`insert into sample.student values(\'${student.name}\',\'${student.title}\',\'${student.class}\',\'${student.section}\',${student.rollId})`)
            .then(res => {
                pool.query(`select * from sample.student where student.rollId= ${student.rollId}`)
                    .then(res => {
                        resp.statusCode = 201;
                        resp.setHeader('Content-Type', 'Application/json');
                        resp.send(res);
                        console.log("done!");
                    })
                    .catch(err => console.error('Error', err.stack));
            })
            .catch(err => {
                resp.statusCode = 400;
                resp.setHeader('Content-Type', 'Application/json');
                resp.send(err);
                console.log("error!");
            })
    }
});


/**
 * @swagger
 * /student:
 *      put:
 *          description:
 *              to update an existing student or else to create a new student.
 *          produces:
 *              -application/json
 *          parameters:
 *              - name: student
 *                description: student object
 *                in: body
 *                required: true
 *                schema:
 *                     $ref: '#/definitions/student'
 *          responses:
 *              201:    
 *                 description: returns updated or creates a student data
 */
 app.put('/student', jsonParser, (req, resp) => {
    const student = req.body;
    console.log(student);
    if (!student.rollId || typeof (student.rollId) !== 'number' || !student.name || !student.title || !student.class || !student.section ) {
        console.log("error");
        resp.statusCode = 400;
        resp.send({ error: "Bad request" });
    }
    else {
        pool.query(`select count(*) as count from sample.student where rollId =${student.rollId}`)
            .then((res) => {
                console.log(res, res[0].count);
                if (!res[0].count === 1) {
                    pool.query(`insert into sample.student values(\'${student.name}\',\'${student.title}\',\'${student.class}\',\'${student.section}\',${student.rollId})`);

                }
                else {
                    pool.query(`update sample.student set student.name=\'${student.name}\',student.title=\'${student.title}\',student.class=\'${student.class}\',student.section=\'${student.section}\',student.rollId=${student.rollId} where student.rollId=${student.rollId}`)
                        .catch(err => {
                            resp.statusCode = 400;
                            resp.setHeader('Content-Type', 'Application/json');
                            resp.send(err);
                        });
                }
                pool.query(`select * from sample.student where student.rollId= ${student.rollId}`)
                    .then(res => {
                        resp.statusCode = 201;
                        resp.setHeader('Content-Type', 'Application/json');
                        resp.send(res);
                    })
                    .catch(err => console.error('Error', err.stack));
            }).catch(err => {
                resp.statusCode = 400;
                resp.setHeader('Content-Type', 'Application/json');
                resp.send(err);
                console.log("error!");
            })
    }
});


/**
 * @swagger
 * /student/{rollId}:
 *      patch:
 *          description:
 *              to updates an existing student details if student is already present.
 *          parameters:
 *              - in: path
 *                name: Student rollId  
 *                required: true
 *              - in: body
 *                name: Student details
 *                description: Student values
 *                required: true
 *                properties:
 *                    name:
 *                      type: string
 *                    title:
 *                      type: string
 *                    class:
 *                      tyepe: string
 *                    section:
 *                      tyepe: string
 *                
 *          produces:
 *              -application/json
 *          responses:
 *              201:    
 *                 description: Returns updated student data
 */

 app.patch('/student/:rollId', jsonParser, (req, resp) => {
    const student = req.body;
    const rollId = Number(req.params.rollId);
    console.log(rollId);
    console.log(student);
    console.log(Object.keys(student).length);
    if (!rollId || typeof (rollId) !== 'number' || Object.keys(student).length === 0) {
        console.log("error");
        resp.statusCode = 400;
        resp.send({ error: "rollId not found" });
    }
    else {
        console.log(rollId);
        pool.query(`select count(*) as count from sample.student where rollId = ${rollId}`)
            .then((res) => {
                console.log(res[0].count);
                if (res[0].count === 1) {

                    let query = "update sample.student set "
                    if (student.name) query += `name=\'${student.name}\' ,`;
                    if (student.title) query += `title=\'${student.title}\' ,`;
                    if (student.class) query += `class=\'${student.class}\' ,`;
                    if (student.section) query += `section=\'${student.section}\' ,`;
                    query = query.substr(0, query.length - 1);
                    query += `where rollId=${rollId}`;
                    
                    console.log(query);

                    pool.query(query).catch((err) => {
                        resp.statusCode = 400;
                        resp.setHeader('Content-Type', 'Application/json');
                        resp.send(err);
                        console.log("error!");
                    });

                }
                else {
                    resp.statusCode = 400;
                    resp.setHeader('Content-Type', 'Application/json');
                    resp.send({ data: "rollId invalid" });
                }
            })
            .then(() => {
                pool.query(`select * from sample.student where student.rollId= ${rollId}`)
                    .then(res => {
                        resp.statusCode = 201;
                        resp.setHeader('Content-Type', 'Application/json');
                        resp.send(res);
                        console.log("done!");
                    })
                    .catch(err => console.error('Error', err.stack));
            })
            .catch(err => {
                resp.statusCode = 400;
                resp.setHeader('Content-Type', 'Application/json');
                resp.send(err);
                console.log("error!");
            })
    }
});

/**
 * @swagger
 * /student/{rollId}:
 *      delete:
 *          description:
 *              to delete a student based on rollId
 *          produces:
 *              -application/json
 *          parameters:
 *              - name: rollId
 *                description: Student Id
 *                in: path
 *                required: true
 *          schema:
 *              type: integer
 *              minimum: 1
 *          responses:
 *              204:  
 *                  description: Succesfully Deleted  
*/
app.delete(`/student/:rollId`, jsonParser, (req, resp) => {
    const rollId = parseInt(req.params.rollId);
    console.log(rollId);
    if (!rollId) {
        console.log("error");
        resp.statusCode = 400;
        resp.send({ error: "rollId is missing or incorrect" });
    }
    else {
        pool.query(`select count(*) as count from sample.student where rollId =${rollId}`)
            .then((res) => {
                if (res[0].count) {
                    pool.query(`delete from sample.student where rollId=${rollId}`)
                        .then(res => {
                            resp.statusCode = 204;
                            resp.setHeader('Content-Type', 'Application/json');
                            resp.send({});
                            console.log("done!");
                        })
                }
                else {
                    resp.statusCode = 400;
                    resp.setHeader('Content-Type', 'Application/json');
                    resp.send({ data: 'Invalid rollId' });
                }
            }).catch(err => {
                resp.statusCode = 400;
                resp.setHeader('Content-Type', 'Application/json');
                resp.send(err);
                console.log("error!");
            });
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`, port);
});