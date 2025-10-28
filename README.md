# Engageable for NestJS

<p align="center">
<img src="https://raw.githubusercontent.com/IsaiahTek/engageable-nestjs/main/images/engageable-nestjs-module-icon.png" alt="Engageable NestJs Module/Plugin" />
</p>


**engageable** is a powerful, plug-and-play **NestJS engagement plugin** that adds social interaction features like **likes**, **comments**, **bookmarks**, **reposts**, and more — to any entity in your application.

Built with **TypeORM** and **NestJS best practices**, engageable makes it easy to add engagement functionality across your project with minimal setup.

---

## Features

- ✅ **Drop-in Engagement System** — Easily attach likes, comments, bookmarks, and reposts to any entity.
- ✅ **Modular NestJS Plugin** — Import as a Nest module or apply via decorators.
- ✅ **TypeORM Ready** — Works seamlessly with your existing TypeORM entities.
- ✅ **Extensible Design** — Add your own custom engagement types.
- ✅ **Lightweight & Scalable** — Built for production-ready APIs.

---

## Installation

```bash
# with npm
npm install engageable-nestjs

# or with yarn
yarn add engageable-nestjs

npm install @nestjs/common @nestjs/core @nestjs/typeorm typeorm
```

## Registration of the module

```javascript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { engageableModule } from "engageable-nestjs";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      /* ...database config... */
    }),
    engageableModule.register(),
  ],
})
export class AppModule {}
```

## Usage

```javascript
import { Entity, Column } from "typeorm";
import { Engageable } from "engageable-nestjs";

@Entity()
@Engageable()
export class Post {
  @Column()
  title: string;

  @Column()
  content: string;
}
```
