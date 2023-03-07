import {
  WebSocketServer,
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import * as WebSocket from 'ws';

@WebSocketGateway({ namespace: 'streaming' })
export class BitstampGateway {
  @WebSocketServer() server: Server;
  private ws: WebSocket;
  private subscriptions: string[] = [];
  private currencyPairInfo = new Map();
  private timerId: NodeJS.Timeout;

  constructor() {
    this.ws = new WebSocket('wss://ws.bitstamp.net');
    this.ws.on('open', () => {
      console.log('Connected to WebSocket API');
    });
    this.ws.on('message', (data: WebSocket.Data) => {
      const message = JSON.parse(data.toString());
      if (message.event === 'trade') {
        const currencyPair = this.currencyPairInfo.get(message.channel) || [];
        if (!currencyPair) {
          this.server.emit('ticker', message.data);
        }
        currencyPair.push(message.data);
        this.currencyPairInfo.set(message.channel, currencyPair);
      }
    });
  }

  @SubscribeMessage('subscribe')
  async handleSubscribe(@MessageBody() body: any) {
    const pairs = body.pairs;
    for (const pair of pairs) {
      if (!this.subscriptions.includes(`live_trades_${pair}`)) {
        this.subscriptions.push(`live_trades_${pair}`);
        this.ws.send(
          JSON.stringify({
            event: 'bts:subscribe',
            data: {
              channel: `live_trades_${pair}`,
            },
          }),
        );
      }
    }

    this.timerId = setInterval(() => {
      const ohlc = [];
      this.subscriptions.forEach((key) => {
        const targetCurrencyPair = this.currencyPairInfo.get(key);
        ohlc.push({
          currencyPair: key,
          first: targetCurrencyPair ? targetCurrencyPair[0].price : 'no price',
          highest: targetCurrencyPair ? Math.max(...targetCurrencyPair.map((item) => item.price)) : 'no price',
          lowest: targetCurrencyPair ? Math.min(...targetCurrencyPair.map((item) => item.price)) : 'no price',
          last: targetCurrencyPair ? targetCurrencyPair[targetCurrencyPair.length - 1].price : 'no price',
        });
        this.currencyPairInfo.set(key, undefined);
      });
      this.server.emit('ticker', ohlc);
    }, 5000);
  }

  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(@MessageBody() body: any) {
    const pairs = body.pairs;
    for (const pair of pairs) {
      const index = this.subscriptions.indexOf(`live_trades_${pair}`);
      if (index >= 0) {
        this.subscriptions.splice(index, 1);
        this.currencyPairInfo.delete(`live_trades_${pair}`);
        this.ws.send(
          JSON.stringify({
            event: 'bts:unsubscribe',
            data: {
              channel: `live_trades_${pair}`,
            },
          }),
        );
      }
    }
    if (!this.subscriptions.length) {
      clearInterval(this.timerId);
    }
  }
}
