// backend/server.js
const express = require("express");
const cors = require("cors");
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your-secret-key';

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://innovation-showcase-frontend.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Don't exit the process
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    // Don't exit the process
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Ensure data directory exists
async function ensureDataDirectory() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.mkdir(path.join(__dirname, 'uploads'), { recursive: true });
    } catch (error) {
        console.error('Error creating directories:', error);
        // Don't exit on directory creation error
    }
}

// Initialize data files if they don't exist
async function initializeDataFiles() {
    try {
        await ensureDataDirectory();
        
        const files = {
            [USERS_FILE]: [],
            [PROJECTS_FILE]: [],
            [COMMENTS_FILE]: []
        };

        for (const [file, defaultData] of Object.entries(files)) {
            try {
                await fs.access(file);
            } catch {
                await fs.writeFile(file, JSON.stringify(defaultData, null, 2));
                console.log(`Created ${file}`);
            }
        }
    } catch (error) {
        console.error('Error initializing data files:', error);
        // Don't exit on initialization error
    }
}

// Helper functions for file operations
async function readData(file) {
    try {
        const data = await fs.readFile(file, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${file}:`, error);
        return [];
    }
}

async function writeData(file, data) {
    try {
        await fs.writeFile(file, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing to ${file}:`, error);
        throw error;
    }
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, email, role } = req.body;

        // Input validation
        if (!username || !password || !email) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        if (!email.includes('@')) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const users = await readData(USERS_FILE);

        if (users.some(user => user.username === username)) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        if (users.some(user => user.email === email)) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: Date.now().toString(),
            username,
            password: hashedPassword,
            email,
            role: role || 'user',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        await writeData(USERS_FILE, users);

        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ message: 'Request body is missing' });
        }

        const { username, email, password } = req.body;
        
        if (!password || (!username && !email)) {
            return res.status(400).json({ message: 'Email/username and password are required' });
        }

        const users = await readData(USERS_FILE);
        
        // Try to find user by username or email
        const user = users.find(u => 
            (username && u.username === username) || 
            (email && u.email === email)
        );

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Project routes
app.get('/api/projects', async (req, res) => {
    try {
        let projects = await readData(PROJECTS_FILE);
        
        // If no projects exist, create sample project
        if (!projects || projects.length === 0) {
            projects = [{
                id: '1',
                title: 'Smart Home Automation System',
                description: 'An innovative IoT-based home automation system that allows users to control their home appliances remotely using a mobile app. Features include energy monitoring, security integration, and voice control capabilities.',
                category: 'IoT',
                imageUrl: '/uploads/sample-project.jpg',
                userId: '1',
                createdAt: '2024-04-21T12:00:00.000Z',
                status: 'approved',
                tags: ['IoT', 'Home Automation', 'Mobile App', 'Energy Efficiency']
            }];
            await writeData(PROJECTS_FILE, projects);
        }

        // Only return approved projects for non-admin users
        const filteredProjects = projects.filter(project => project.status === 'approved');
        console.log('Returning projects:', filteredProjects);
        res.json(filteredProjects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Error fetching projects' });
    }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
    try {
        const { title, description, category, tags, video_link } = req.body;
        const projects = await readData(PROJECTS_FILE);

        const newProject = {
            id: Date.now().toString(),
            title,
            description,
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            video_link: video_link || null,
            userId: req.user.id,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };

        projects.push(newProject);
        await writeData(PROJECTS_FILE, projects);

        res.status(201).json(newProject);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Error creating project' });
    }
});

app.get('/api/projects/:id', async (req, res) => {
    try {
        const projects = await readData(PROJECTS_FILE);
        const project = projects.find(p => p.id === req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching project' });
    }
});

// Comment routes
app.post('/api/comments', authenticateToken, async (req, res) => {
    try {
        const { projectId, content } = req.body;
        const comments = await readData(COMMENTS_FILE);

        const newComment = {
            id: Date.now().toString(),
            projectId,
            userId: req.user.id,
            content,
            createdAt: new Date().toISOString()
        };

        comments.push(newComment);
        await writeData(COMMENTS_FILE, comments);

        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment' });
    }
});

app.get('/api/projects/:id/comments', async (req, res) => {
    try {
        const comments = await readData(COMMENTS_FILE);
        const projectComments = comments.filter(c => c.projectId === req.params.id);
        res.json(projectComments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments' });
    }
});

// Admin routes
app.get('/api/admin/projects', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const projects = await readData(PROJECTS_FILE);
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects' });
    }
});

app.put('/api/admin/projects/:id/status', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const { status } = req.body;
        const projects = await readData(PROJECTS_FILE);
        const projectIndex = projects.findIndex(p => p.id === req.params.id);

        if (projectIndex === -1) {
            return res.status(404).json({ message: 'Project not found' });
        }

        projects[projectIndex].status = status;
        await writeData(PROJECTS_FILE, projects);

        res.json(projects[projectIndex]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating project status' });
    }
});

app.use('/api/admin', adminRoutes);

// Initialize data files and start server
initializeDataFiles().then(() => {
    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    server.on('error', (error) => {
        console.error('Server error:', error);
    });
}).catch((error) => {
    console.error('Startup error:', error);
});
