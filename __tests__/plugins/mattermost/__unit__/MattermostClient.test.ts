/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { SuperAgentRequest } from 'superagent';
import { MattermostClient } from '../../../../src/plugins/mattermost/MattermostClient';
import { MattermostMiddleware } from '../../../../src/plugins/mattermost/MattermostMiddleware';
import { IMattermostOption } from '../../../../src/types';

describe('MMClient unit', () => {
  it('empty, blank, or null tlsOptions', () => {
    const snapAgent = (agent: SuperAgentRequest, testName: string) => {
      // agent._ca tracks the loaded cert authority, and is not dumped as part of normal object
      expect((agent as any)._ca).toMatchSnapshot(testName);
    };

    const tests: { name: string; ca: any; validate: (agent: SuperAgentRequest, testName: string) => void }[] = [
      { name: 'ca 0spaces', ca: '', validate: snapAgent },
      { name: 'ca 3spaces', ca: '  ', validate: snapAgent },
      { name: 'ca manySpaces', ca: '          ', validate: snapAgent },
      { name: 'ca null', ca: null, validate: snapAgent },
      { name: 'ca undefined', ca: undefined, validate: snapAgent },
      { name: 'realPath', ca: '/bad/path', validate: snapAgent },
    ];

    for (const test of tests) {
      const client = new MattermostClient(
        {} as MattermostMiddleware,
        {
          protocol: 'https',
          tlsCertificate: test.ca,
        } as IMattermostOption,
      );

      const postReq = client.post('badurl');
      test.validate(postReq, 'post_' + test.name);
      const getReq = (client as any).buildGet('badurl');
      test.validate(getReq, 'get_' + test.name);
    }
  });
});
