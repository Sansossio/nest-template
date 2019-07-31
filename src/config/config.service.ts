import * as _ from 'lodash';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as defaultConfig from './configs/default';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
export interface IConfig {
  [key: string]: any;
}
dotenv.config();

export interface EnvConfig {
  [key: string]: string;
}

@Injectable()
export class ConfigService {
  private config: IConfig = defaultConfig.default;

  constructor() {
    this.loadEnv();
    this.loadConfiguration();
  }

  private set(key: string, value: any) {
    _.set(this.config, key, value);
  }

  private loadEnv() {
    const { env } = process;
    for (const key in env) {
      const value = env[key];
      if (key.indexOf('npm_') !== 0) {
        this.set(key, value);
      }
    }
  }

  private loadConfiguration() {
    const { NODE_ENV } = process.env;
    if (!NODE_ENV) return;
    const path: string = `${__dirname}/configs/${NODE_ENV}`;
    const availableExt: string[] = ['ts', 'js', 'json'];
    let foundExt: boolean = false;
    for (const ext of availableExt) {
      const fullPath: string = `${path}.${ext}`;
      if (fs.existsSync(fullPath)) {
        const configEnv = require(fullPath).default;
        this.config = _.merge(this.config, configEnv);
        foundExt = true;
        break;
      }
    }
    if (!foundExt) {
      console.error(`No config found for environment: ${NODE_ENV}`);
      return;
    }
    console.log(`Loaded configuration to env: ${NODE_ENV}`);
  }

  get<T>(key: string): T {
    return _.get(this.config, key);
  }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return this.get<TypeOrmModuleOptions>('database.postgres');
  }
}
