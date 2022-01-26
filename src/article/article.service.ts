import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { CreateArticleDTO } from './dto/createArticle.dto';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import slugify from 'slugify';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}

  async createArticle(
    author: UserEntity,
    createArticleDTO: CreateArticleDTO,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();

    Object.assign(article, { ...createArticleDTO, author });

    if (!article.tagList) {
      article.tagList = [];
    }

    article.slug = this.getSlug(createArticleDTO.title);

    return this.articleRepository.save(article);
  }

  async findBySlug(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne(
      { slug },
      { relations: ['author'] },
    );

    if (!article) {
      throw new HttpException(
        'No article matching the given slug was found.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return article;
  }

  async deleteArticle(
    currentUserId: string,
    slug: string,
  ): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException(
        'No article matching the given slug was found.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (article.author.id !== currentUserId) {
      throw new HttpException(
        `Your id does not match author's id.`,
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.articleRepository.delete({ slug });
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  getSlug(title: string) {
    return `${encodeURI(slugify(title, { lower: true }))}-${(
      (Math.random() * Math.pow(36, 6)) |
      0
    ).toString(36)}`;
  }
}
