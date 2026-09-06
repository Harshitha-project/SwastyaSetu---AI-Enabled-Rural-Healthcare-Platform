import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { authorize } from '../middleware/role.middleware'
import {
  listArticles,
  getArticleById,
  getArticlesByCategory,
  getCategories,
  searchArticles,
  createArticle,
  updateArticle,
  publishArticle,
  deleteArticle,
} from '../controllers/education.controller'

const router = Router()

// Public routes
// GET /api/education/articles - List published articles
router.get('/articles', listArticles)

// GET /api/education/categories - Get categories with counts
router.get('/categories', getCategories)

// GET /api/education/search - Search articles
router.get('/search', searchArticles)

// GET /api/education/category/:category - Get articles by category
router.get('/category/:category', getArticlesByCategory)

// GET /api/education/articles/:id - Get article by ID
router.get('/articles/:id', getArticleById)

// Admin routes (protected)
// POST /api/education/articles - Create article
router.post('/articles', authenticate, authorize('ADMIN'), createArticle)

// PUT /api/education/articles/:id - Update article
router.put('/articles/:id', authenticate, authorize('ADMIN'), updateArticle)

// PUT /api/education/articles/:id/publish - Publish article
router.put('/articles/:id/publish', authenticate, authorize('ADMIN'), publishArticle)

// DELETE /api/education/articles/:id - Delete article
router.delete('/articles/:id', authenticate, authorize('ADMIN'), deleteArticle)

export default router
