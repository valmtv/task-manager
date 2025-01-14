// Mock API functions for now
const api = {
  get: async (url) => {
    // Simulate a delay for network request
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock data for projects
    if (url === '/projects') {
      return {
        data: [
          { id: 1, name: 'Project Alpha', description: 'This is the first project', status: 'In Progress' },
          { id: 2, name: 'Project Beta', description: 'This is the second project', status: 'Not Started' },
        ],
      };
    }

    // Mock data for tasks
    if (url === '/tasks') {
      return {
        data: [
          { id: 1, name: 'Task 1', description: 'This is the first task', status: 'Pending', priority: 'Medium' },
          { id: 2, name: 'Task 2', description: 'This is the second task', status: 'In Progress', priority: 'High' },
        ],
      };
    }
    // mocj for notifications
    if (url === '/notifications') {
      return {
        data: [
          { id: 1, message: 'Task 1 is overdue', type: 'Overdue', isRead: false },
          { id: 2, message: 'Task 2 has been updated', type: 'Task Update', isRead: true },
        ],
      };
    }

    // Default response for unknown endpoints
    throw new Error(`Unknown endpoint: ${url}`);
  },
};

export default api;
