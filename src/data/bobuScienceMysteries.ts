/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import bobuMysteriesData from './bobuScienceMysteries.json';

export interface BobuScienceMystery {
  id: string;
  title: string;
  content: string;
  question: string;
  options: string[];
  answer: number;
  sciencePrinciple: string;
}

export const BOBU_SCIENCE_MYSTERIES: BobuScienceMystery[] = bobuMysteriesData;

export default BOBU_SCIENCE_MYSTERIES;
