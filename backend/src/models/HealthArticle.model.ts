import mongoose, { Schema, Document, Types } from 'mongoose'
import { ArticleCategory, ILocalizedText } from '../types'

export interface IHealthArticle extends Document {
  _id: Types.ObjectId
  title: ILocalizedText
  category: ArticleCategory
  content: ILocalizedText
  keyPoints: ILocalizedText[]
  preventionTips: ILocalizedText[]
  whenToSeekHelp: ILocalizedText
  imageUrl?: string
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

const localizedTextSchema = new Schema<ILocalizedText>(
  {
    en: { type: String, required: true },
    mr: { type: String, required: true },
    hi: { type: String, required: true },
  },
  { _id: false }
)

const healthArticleSchema = new Schema<IHealthArticle>(
  {
    title: {
      type: localizedTextSchema,
      required: true,
    },
    category: {
      type: String,
      enum: ['MATERNAL', 'CHILD', 'DIABETES', 'HEART', 'MENTAL', 'NUTRITION', 'INFECTIOUS', 'FIRST_AID'] as ArticleCategory[],
      required: true,
      index: true,
    },
    content: {
      type: localizedTextSchema,
      required: true,
    },
    keyPoints: {
      type: [localizedTextSchema],
      default: [],
    },
    preventionTips: {
      type: [localizedTextSchema],
      default: [],
    },
    whenToSeekHelp: {
      type: localizedTextSchema,
      required: true,
    },
    imageUrl: String,
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const { __v, ...rest } = ret
        return rest
      },
    },
  }
)

// Indexes
healthArticleSchema.index({ category: 1, isPublished: 1 })

const HealthArticle = mongoose.model<IHealthArticle>('HealthArticle', healthArticleSchema)

export default HealthArticle
