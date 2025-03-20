# Open-Research-Platform
A decentralized, research collaboration platform where academics, scientists, and enthusiasts can work together, share datasets, and publish findings in an open and transparent manner.

### Tech Stack used:
- Backend:
    - Ruby on Rails (RoR) – For handling business logic, user authentication, and APIs.
    - PostgreSQL – For structured storage of research papers, user profiles, and collaboration history.
    - Redis + Sidekiq – For background tasks (like AI-powered research summarization).
    - Action Cable – For real-time collaboration (live document editing, chat, discussions).
    - JWT Authentication (Devise-JWT) – Secure token-based authentication.

- Frontend:
    - React.js – For a dynamic and interactive UI.
    - Tailwind CSS – For a clean, responsive, and modern design.
    - Redux Toolkit – State management

### Progress:
  
- [x] Initialize Rails API with PostgreSQL
- [x] Initialize React app
- [x] Set up Material UI for frontend styling  
- [ ] Set up Devise-JWT authentication for user login/signup  
- [ ] Create models & migrations for Users, Research Papers, Comments, Collaborations
- [ ] Implement CRUD APIs for research papers & user profiles  
- [ ] Configure CORS settings to allow frontend API calls  
- [ ] Set up Sidekiq + Redis for AI summarization background jobs  
- [ ] Configure Action Cable WebSockets for real-time collaboration & chat   
- [ ] Implement JWT authentication for user login/signup  
- [ ] Create UI components for research papers, profiles, and collaboration rooms
- [ ] Integrate Rails API using Axios + React Query 
- [ ] Implement Redux Toolkit for global state management  
- [ ] Connect WebSockets (Action Cable client) for live updates  
- [ ] Dockerize backend & frontend for deployment 

