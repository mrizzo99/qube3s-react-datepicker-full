import type { StorybookConfig } from "@storybook/react";

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: { name: '@storybook/react', options: {} }
};
export default config;
