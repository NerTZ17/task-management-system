import mongoose from 'mongoose';
import Task from '../models/Task.js';
import {
  createTaskSchema,
  updateTaskSchema,
  getZodErrorMessage,
} from '../validations/taskValidation.js';

const allowedStatuses = ['pending', 'in-progress', 'done'];

const isInvalidStatusTransition = (currentStatus, nextStatus) => {
  if (currentStatus === 'in-progress' && nextStatus === 'pending') {
    return true;
  }

  if (currentStatus === 'done' && nextStatus !== 'done') {
    return true;
  }

  return false;
};

const formatTaskResponse = (task) => {
  return {
    id: task._id,
    title: task.title,
    description: task.description,
    status: task.status,
    deadline: task.deadline,
    user_id: task.user_id,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
};

const parseDeadline = (deadline) => {
  if (deadline === undefined) {
    return undefined;
  }

  if (deadline === null || deadline === '') {
    return null;
  }

  const parsedDate = new Date(deadline);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error('Deadline must be a valid date');
  }

  return parsedDate;
};

export const getTasks = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {
      user_id: req.user._id,
    };

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'Status must be pending, in-progress, or done',
          token: null,
        });
      }

      filter.status = status;
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        tasks: tasks.map(formatTaskResponse),
      },
      message: 'Tasks fetched successfully',
      token: null,
    });
  } catch (error) {
    console.error('Get tasks error:', error);

    return res.status(500).json({
      success: false,
      data: null,
      message: 'Internal server error',
      token: null,
    });
  }
};

export const createTask = async (req, res) => {
  try {
    const validation = createTaskSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        data: null,
        message: getZodErrorMessage(validation.error),
        token: null,
      });
    }

    const {
      title,
      description,
      status,
      deadline,
    } = validation.data;

    let parsedDeadline;

    try {
      parsedDeadline = parseDeadline(deadline);
    } catch (error) {
      return res.status(400).json({
        success: false,
        data: null,
        message: error.message,
        token: null,
      });
    }

    const task = await Task.create({
      user_id: req.user._id,
      title,
      description,
      status,
      deadline: parsedDeadline,
    });

    return res.status(201).json({
      success: true,
      data: {
        task: formatTaskResponse(task),
      },
      message: 'Task created successfully',
      token: null,
    });
  } catch (error) {
    console.error('Create task error:', error);

    return res.status(500).json({
      success: false,
      data: null,
      message: 'Internal server error',
      token: null,
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const validation = updateTaskSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        data: null,
        message: getZodErrorMessage(validation.error),
        token: null,
      });
    }

    const { title, description, status, deadline } = validation.data;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Task not found',
        token: null,
      });
    }

    const task = await Task.findOne({
      _id: id,
      user_id: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Task not found',
        token: null,
      });
    }

    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'Title is required',
          token: null,
        });
      }

      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = description?.trim() || '';
    }

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'Status must be pending, in-progress, or done',
          token: null,
        });
      }

      if (isInvalidStatusTransition(task.status, status)) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'Task status cannot be moved backward',
          token: null,
        });
      }

      task.status = status;
    }

    if (deadline !== undefined) {
      try {
        task.deadline = parseDeadline(deadline);
      } catch (error) {
        return res.status(400).json({
          success: false,
          data: null,
          message: error.message,
          token: null,
        });
      }
    }

    await task.save();

    return res.status(200).json({
      success: true,
      data: {
        task: formatTaskResponse(task),
      },
      message: 'Task updated successfully',
      token: null,
    });
  } catch (error) {
    console.error('Update task error:', error);

    return res.status(500).json({
      success: false,
      data: null,
      message: 'Internal server error',
      token: null,
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Task not found',
        token: null,
      });
    }

    const task = await Task.findOneAndDelete({
      _id: id,
      user_id: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Task not found',
        token: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Task deleted successfully',
      token: null,
    });
  } catch (error) {
    console.error('Delete task error:', error);

    return res.status(500).json({
      success: false,
      data: null,
      message: 'Internal server error',
      token: null,
    });
  }
};