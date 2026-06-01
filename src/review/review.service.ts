import { BadRequestException, Injectable } from '@nestjs/common';
import { ReviewRepository } from './review.repository';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async create(userId: string, dto: CreateReviewDto) {
    const existingReview = await this.reviewRepository.findByOrderId(dto.orderId);

    if (existingReview) {
      throw new BadRequestException('Order has already been reviewed');
    }

    const review = await this.reviewRepository.create({
      userId,
      merchantId: dto.merchantId,
      orderId: dto.orderId,
      rating: dto.rating,
      comment: dto.comment,
    });

    return {
      reviewId: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    };
  }
}
