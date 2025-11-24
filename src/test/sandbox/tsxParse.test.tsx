import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

describe('TSX parse sanity', () => {
  it('should render a simple JSX element', () => {
    render(<div data-testid="jsxtest">Hello</div>);
    expect(screen.getByTestId('jsxtest')).toBeInTheDocument();
  });
});
