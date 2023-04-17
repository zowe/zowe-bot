/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { SlackMiddleware } from '../../../../src/plugins/slack/SlackMiddleware';
import { IChatContextData, IMessage, IMessageType } from '../../../../src/types';
import { MockCommonBot } from '../../../common/mocks/MockCommonBot';
import { MockContexts } from '../../../common/mocks/MockContexts';
import { App } from '@slack/bolt';

describe('Slack Middleware Tests', () => {
  const middlewareMock: {
    app: App;
    sendDirectMessage: (chatContextData: IChatContextData, messages: IMessage[]) => Promise<boolean>;
  } = new SlackMiddleware(MockCommonBot.SLACK_BOT) as any;

  it('Slack sendDirectMessage text', async () => {
    const ctx = MockContexts.SLACK_PERSONAL_DM_CTX;
    const testMsg = {
      type: IMessageType.PLAIN_TEXT,
      message: 'Test DM',
    };

    middlewareMock.app.client.chat.postMessage = jest.fn((args: any) => {
      return '' as any;
    });

    const sent = await middlewareMock.sendDirectMessage(ctx, [testMsg]);

    expect(middlewareMock.app.client.chat.postMessage).toBeCalledWith({
      channel: ctx.context.chatting.channel.id,
      text: testMsg.message,
    });
    expect(sent).toBe(true);
  });

  it('Slack extended sendDirectMessage tests', async () => {
    // Basic test cases
    const testCases: IMessage[][] = [
      [
        { type: IMessageType.PLAIN_TEXT, message: 'hi' },
        { type: IMessageType.PLAIN_TEXT, message: 'over' },
      ],
      [
        {
          type: IMessageType.SLACK_BLOCK,
          message: {
            channel: 'default_channel',
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: '<a>a link</a>',
                },
              },
            ],
          },
        },
      ],
      [
        {
          type: IMessageType.SLACK_VIEW_OPEN,
          message: {
            channel: 'default_channel',
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: '<a>a link</a>',
                },
              },
            ],
          },
        },
      ],
      [
        {
          type: IMessageType.SLACK_VIEW_UPDATE,
          message: {
            channel: 'default_channel',
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: '<a>a link</a>',
                },
              },
            ],
          },
        },
      ],
    ];

    const ctx = MockContexts.SLACK_PERSONAL_DM_CTX;

    middlewareMock.app.client.chat.postMessage = jest.fn((args: any) => {
      return '' as any;
    });
    middlewareMock.app.client.views.open = jest.fn((args: any) => {
      return '' as any;
    });
    middlewareMock.app.client.views.update = jest.fn((args: any) => {
      return '' as any;
    });

    for (const test of testCases) {
      const sent = await middlewareMock.sendDirectMessage(ctx, test);
      const lastTest = test[test.length - 1];
      if (lastTest.type === IMessageType.PLAIN_TEXT) {
        expect(middlewareMock.app.client.chat.postMessage).toBeCalledTimes(test.length);
        expect(middlewareMock.app.client.chat.postMessage).lastCalledWith({
          channel: ctx.context.chatting.channel.id,
          text: lastTest.message,
        });
      }
      // message channel will be replaced with dm
      if (lastTest.type === IMessageType.SLACK_VIEW_OPEN) {
        expect(middlewareMock.app.client.views.open).toBeCalledTimes(test.length);
        expect(middlewareMock.app.client.views.open).lastCalledWith({
          ...lastTest.message,
          channel: ctx.context.chatting.channel.id,
        });
      }
      if (lastTest.type === IMessageType.SLACK_VIEW_UPDATE) {
        expect(middlewareMock.app.client.views.update).toBeCalledTimes(test.length);
        expect(middlewareMock.app.client.views.update).lastCalledWith(lastTest.message);
      }
      expect(sent).toBe(true);
    }
  });
});
