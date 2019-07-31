import { createParamDecorator, BadRequestException } from '@nestjs/common';
import * as _ from 'lodash';
import { Raw } from 'typeorm';

/**
 * Filter decorator
 * Simple: { where: { active: true } }
 * Extract data of req object: { where: { user: { source: 'req', target: 'body.user'} } }
 */
export const Filter = createParamDecorator((data, req) => {
  const requiredWhere = _.get(_.cloneDeep(data), 'where');
  for (const option of _.keys(requiredWhere)) {
    const value: any = requiredWhere[option];
    const source: string = _.get(value, 'source');
    const target: string = _.get(value, 'target');
    if (source === 'req') {
      requiredWhere[option] = _.get(req, target);
    }
  }
  let receiveFilter: any = _.get(req, 'query.filter');
  if (!receiveFilter) {
    receiveFilter = {};
  }
  return queryPipe(receiveFilter, requiredWhere);
});

const queryPipe = (filter: any, requiredWhere) => {
  const query = { filter };
  try {
    if (typeof query.filter === 'string') {
      query.filter = JSON.parse(query.filter);
    }
    query.filter.where = query.filter.where || {};
    if (query.filter.where instanceof Array) {
      query.filter.where = query.filter.where.map(where => Object.assign(parseQuery(where), requiredWhere));
    } else {
      query.filter.where = Object.assign(parseQuery(query.filter.where), requiredWhere);
    }
    return query.filter;
  } catch (err) {
    throw new BadRequestException(err.message);
  }
};

const parseQuery = where => {
  for (const key of Object.keys(where)) {
    let query = where[key];
    let conector = '=';
    if (typeof query === 'object') {
      if (query.type) query.type = `::${query.type}`;
      if (query.method) query.method = query.method.toLowerCase();
      conector = query.method.toUpperCase();
      switch (query.method) {
        case 'between':
          query.value = `'${query.values[0]}'${query.type || ''} and '${query.values[1]}'${query.type || ''}`;
          break;
        case 'in':
          const parsedValue = value => `'${value}'`;
          query.value = `(${query.values.map(parsedValue).join(',')})`;
          break;
        case 'like':
        case 'ilike':
          query.value = `'${query.value}'${query.type || ''}`;
          break;
        case '>':
        case '<':
          query.value = `'${query.value}'${query.type || ''}`;
          break;
        default:
          conector = '=';
          query.value = `'${query.value}'`;
      }
    }
    if (typeof query === 'string') {
      query = `'${query}'`;
    }
    let condition = `"${key}" ${conector} ${query.value || query}`;
    if (query.collection) {
      condition = `"${query.collection}".${condition}`;
      where[query.collection] = Raw(() => condition);
    }
    where[key] = Raw(() => condition);
  }
  return where;
};
