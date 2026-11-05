import { toDate } from '@plone/volto/helpers/Utils/Date';

export class BasicModel {
  constructor(record) {
    const basic = {
      _original: record,
    };

    return new Proxy(basic, this);
  }

  get(target, name) {
    if (target.hasOwnProperty(name)) {
      return target[name];
    }

    const proto = Object.getPrototypeOf(this);
    const descriptors = Object.getOwnPropertyDescriptors(proto);

    if (descriptors[name] && descriptors[name].get) {
      const value = descriptors[name].get.bind(target).apply();
      delete target[name];
      target[name] = value;
      return target[name];
    } else {
      return target._original[name];
    }
  }
}

// One day in milliseconds
const oneDay = 1000 * 60 * 60 * 24;

const diffDates = (start, end) =>
  Math.round((end.getTime() - start.getTime()) / oneDay);

const daysSinceIssued = (item) => {
  const raw = item['EffectiveDate'];
  if (!raw || raw === 'None') return Infinity;

  const res = diffDates(toDate(raw), new Date());

  return res;
};

export class Item extends BasicModel {
  get daysSinceIssued() {
    return daysSinceIssued(this._original);
  }

  get isNew() {
    const days = daysSinceIssued(this._original);
    return days < 30;
  }

  get issued() {
    const raw = this._original['EffectiveDate'];
    return raw && raw !== 'None' ? toDate(raw) : null;
  }

  get expires() {
    const raw = this._original['ExpirationDate'];
    return raw && raw !== 'None' ? toDate(raw) : null;
  }
  get isExpired() {
    const raw = this._original['ExpirationDate'];
    if (!raw || raw === 'None') return null;

    const date = toDate(raw);
    return date < new Date();
  }
}
