import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AppService {
  async getData() {
    const res = await axios.get(
      'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty',
    );
    return res.data;
  }
}
