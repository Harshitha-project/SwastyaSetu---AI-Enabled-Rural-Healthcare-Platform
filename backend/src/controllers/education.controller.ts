import { Request, Response } from 'express'
import { HealthArticle } from '../models'
import {
  sendSuccess,
  sendCreated,
  sendError,
  sendNotFound,
  sendUnauthorized,
  sendServerError,
} from '../utils/response.utils'
import { AuthRequest } from '../types'

// List published articles
export async function listArticles(req: Request, res: Response): Promise<Response> {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      search,
      language = 'en',
    } = req.query

    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.min(50, Number(limit))
    const skip = (pageNum - 1) * limitNum

    const query: any = { isPublished: true }

    if (category) {
      query.category = category
    }

    if (search) {
      // Search in appropriate language field
      const searchRegex = new RegExp(search as string, 'i')
      const langKey = language as string
      query[`title.${langKey}`] = searchRegex
    }

    const [articles, total] = await Promise.all([
      HealthArticle.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      HealthArticle.countDocuments(query),
    ])

    // Transform based on language
    const lang = (language as string) || 'en'
    const transformedArticles = articles.map((article: any) => ({
      id: article._id,
      title: article.title?.[lang] || article.title?.en,
      category: article.category,
      imageUrl: article.imageUrl,
      createdAt: article.createdAt,
    }))

    return sendSuccess(res, {
      articles: transformedArticles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('List articles error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get article by ID
export async function getArticleById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params
    const { language = 'en' } = req.query

    const article = await HealthArticle.findById(id).lean()

    if (!article) {
      return sendNotFound(res, 'Article not found')
    }

    const lang = (language as string) || 'en'

    // Return content in requested language
    const response = {
      id: article._id,
      title: article.title?.[lang as keyof typeof article.title] || article.title?.en,
      content: article.content?.[lang as keyof typeof article.content] || article.content?.en,
      category: article.category,
      keyPoints: article.keyPoints?.map((kp: any) => kp[lang] || kp.en),
      preventionTips: article.preventionTips?.map((pt: any) => pt[lang] || pt.en),
      whenToSeekHelp: article.whenToSeekHelp?.[lang as keyof typeof article.whenToSeekHelp] || article.whenToSeekHelp?.en,
      imageUrl: article.imageUrl,
      createdAt: article.createdAt,
    }

    return sendSuccess(res, response)
  } catch (error) {
    console.error('Get article error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get articles by category
export async function getArticlesByCategory(req: Request, res: Response): Promise<Response> {
  try {
    const { category } = req.params
    const { language = 'en', limit = 10 } = req.query

    const articles = await HealthArticle.find({
      isPublished: true,
      category: category.toUpperCase(),
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean()

    const lang = (language as string) || 'en'
    const transformedArticles = articles.map((article: any) => ({
      id: article._id,
      title: article.title?.[lang] || article.title?.en,
      category: article.category,
      imageUrl: article.imageUrl,
    }))

    return sendSuccess(res, transformedArticles)
  } catch (error) {
    console.error('Get articles by category error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get categories with counts
export async function getCategories(req: Request, res: Response): Promise<Response> {
  try {
    const categories = await HealthArticle.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    const categoryLabels: Record<string, { en: string; mr: string; hi: string }> = {
      MATERNAL: { en: 'Maternal Health', mr: 'मातृ आरोग्य', hi: 'मातृ स्वास्थ्य' },
      CHILD: { en: 'Child Health', mr: 'बाल आरोग्य', hi: 'बाल स्वास्थ्य' },
      DIABETES: { en: 'Diabetes', mr: 'मधुमेह', hi: 'मधुमेह' },
      HEART: { en: 'Heart Health', mr: 'हृदय आरोग्य', hi: 'हृदय स्वास्थ्य' },
      MENTAL: { en: 'Mental Health', mr: 'मानसिक आरोग्य', hi: 'मानसिक स्वास्थ्य' },
      NUTRITION: { en: 'Nutrition', mr: 'पोषण', hi: 'पोषण' },
      INFECTIOUS: { en: 'Infectious Diseases', mr: 'संसर्गजन्य रोग', hi: 'संक्रामक रोग' },
      FIRST_AID: { en: 'First Aid', mr: 'प्रथमोपचार', hi: 'प्राथमिक चिकित्सा' },
    }

    const result = categories.map((cat: any) => ({
      id: cat._id,
      count: cat.count,
      labels: categoryLabels[cat._id] || { en: cat._id, mr: cat._id, hi: cat._id },
    }))

    return sendSuccess(res, result)
  } catch (error) {
    console.error('Get categories error:', error)
    return sendServerError(res, error as Error)
  }
}

// Search articles
export async function searchArticles(req: Request, res: Response): Promise<Response> {
  try {
    const { q, language = 'en', limit = 10 } = req.query

    if (!q || (q as string).length < 2) {
      return sendError(res, 'Search query must be at least 2 characters')
    }

    const searchRegex = new RegExp(q as string, 'i')

    const query = {
      isPublished: true,
      $or: [
        { 'title.en': searchRegex },
        { 'title.mr': searchRegex },
        { 'title.hi': searchRegex },
        { 'content.en': searchRegex },
      ],
    }

    const articles = await HealthArticle.find(query)
      .limit(Number(limit))
      .lean()

    const lang = (language as string) || 'en'
    const transformedArticles = articles.map((article: any) => ({
      id: article._id,
      title: article.title?.[lang] || article.title?.en,
      category: article.category,
    }))

    return sendSuccess(res, transformedArticles)
  } catch (error) {
    console.error('Search articles error:', error)
    return sendServerError(res, error as Error)
  }
}

// Admin: Create article
export async function createArticle(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (req.user?.role !== 'ADMIN') {
      return sendUnauthorized(res, 'Only admins can create articles')
    }

    const articleData = req.body

    const article = await HealthArticle.create({
      ...articleData,
      isPublished: false,
    })

    return sendCreated(res, article, 'Article created')
  } catch (error) {
    console.error('Create article error:', error)
    return sendServerError(res, error as Error)
  }
}

// Admin: Update article
export async function updateArticle(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (req.user?.role !== 'ADMIN') {
      return sendUnauthorized(res, 'Only admins can update articles')
    }

    const { id } = req.params
    const updates = req.body

    const article = await HealthArticle.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!article) {
      return sendNotFound(res, 'Article not found')
    }

    return sendSuccess(res, article, 'Article updated')
  } catch (error) {
    console.error('Update article error:', error)
    return sendServerError(res, error as Error)
  }
}

// Admin: Publish article
export async function publishArticle(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (req.user?.role !== 'ADMIN') {
      return sendUnauthorized(res, 'Only admins can publish articles')
    }

    const { id } = req.params

    const article = await HealthArticle.findByIdAndUpdate(
      id,
      { isPublished: true },
      { new: true }
    )

    if (!article) {
      return sendNotFound(res, 'Article not found')
    }

    return sendSuccess(res, article, 'Article published')
  } catch (error) {
    console.error('Publish article error:', error)
    return sendServerError(res, error as Error)
  }
}

// Admin: Delete article
export async function deleteArticle(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (req.user?.role !== 'ADMIN') {
      return sendUnauthorized(res, 'Only admins can delete articles')
    }

    const { id } = req.params

    const article = await HealthArticle.findByIdAndDelete(id)

    if (!article) {
      return sendNotFound(res, 'Article not found')
    }

    return sendSuccess(res, null, 'Article deleted')
  } catch (error) {
    console.error('Delete article error:', error)
    return sendServerError(res, error as Error)
  }
}
