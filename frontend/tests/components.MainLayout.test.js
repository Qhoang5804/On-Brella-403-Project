import { render } from '@testing-library/react';
import { MainLayout } from '../src/components/MainLayout';

// Test that MainLayout renders its children
// This ensures the layout component works as a wrapper

describe('MainLayout', () => {
  it('renders children correctly', () => {
    // Render MainLayout with a test child
    const { getByText } = render(
      <MainLayout>
        <div>Test Child</div>
      </MainLayout>
    );
    // Check that the child is rendered
    expect(getByText('Test Child')).toBeInTheDocument();
  });
});
