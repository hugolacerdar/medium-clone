import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { CreateArticleDTO } from './dto/createArticle.dto';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import slugify from 'slugify';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(
    currentUserId: string,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.author) {
      const author = await this.userRepository.findOne({
        username: query.author,
      });
      queryBuilder.andWhere('articles.authorId = :id', {
        id: author.id,
      });
    }

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();

    return { articles, articlesCount };
  }
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

  async updateArticle(
    currentUserId: string,
    slug: string,
    updateArticleDTO: CreateArticleDTO,
  ): Promise<ArticleEntity> {
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

    Object.assign(article, updateArticleDTO);

    return await this.articleRepository.save({
      ...article,
      slug: this.getSlug(article.title),
    });
  }

  async addArticleToFavorites(
    slug: string,
    currentUserId: string,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException(
        'No article matching the given slug was found.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const user = await this.userRepository.findOne(currentUserId, {
      relations: ['favorites'],
    });

    const isNotFavorited =
      user.favorites.findIndex(
        (articleInFav) => articleInFav.id === article.id,
      ) === -1;

    if (isNotFavorited) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    } else {
      throw new HttpException(
        'You already favorited that article.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return article;
  }

  async removeArticleFromFavorites(
    slug: string,
    currentUserId: string,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException(
        'No article matching the given slug was found.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const user = await this.userRepository.findOne(currentUserId, {
      relations: ['favorites'],
    });

    const articleIndex = user.favorites.findIndex(
      (articleInFav) => articleInFav.id === article.id,
    );

    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);
      article.favoritesCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    } else {
      throw new HttpException(
        'You have not favorited that article.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return article;
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
