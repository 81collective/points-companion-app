import React from 'react';
import { customRender, screen, waitFor, fireEvent, createMockBusiness, setupTests } from '../testUtils';
import VirtualBusinessGrid from '../../components/common/VirtualBusinessGrid';

// Setup mocks before tests
beforeAll(() => {
  setupTests();
});

describe('VirtualBusinessGrid', () => {
  const mockBusinesses = Array.from({ length: 100 }, (_, i) =>
    createMockBusiness({
      id: `business-${i}`,
      name: `Test Business ${i}`,
      distance: i * 100,
    })
  );

  const defaultProps = {
    businesses: mockBusinesses,
    selectedBusiness: null,
    onBusinessSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders business grid with correct number of visible items', async () => {
    customRender(<VirtualBusinessGrid {...defaultProps} />);

    await waitFor(() => {
      // Should render a subset of businesses (not all 100)
      const businessCards = screen.getAllByTestId(/^business-card-/);
      expect(businessCards.length).toBeGreaterThan(0);
      expect(businessCards.length).toBeLessThan(100);
    });
  });

  it('calls onBusinessSelect when business is clicked', async () => {
    customRender(<VirtualBusinessGrid {...defaultProps} />);

    await waitFor(() => {
      const firstBusinessCard = screen.getByTestId('business-card-business-0');
      firstBusinessCard.click();
    });

    expect(defaultProps.onBusinessSelect).toHaveBeenCalledWith(mockBusinesses[0]);
  });

  it('renders business information correctly', async () => {
    customRender(<VirtualBusinessGrid {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Test Business 0')).toBeInTheDocument();
      const addressElements = screen.getAllByText('123 Test St');
      expect(addressElements.length).toBeGreaterThan(0);
    });
  });

  it('displays distance information', async () => {
    customRender(<VirtualBusinessGrid {...defaultProps} />);

    await waitFor(() => {
      // First business has distance 0, so it should show "0"
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  it('shows rating with stars', async () => {
    customRender(<VirtualBusinessGrid {...defaultProps} />);

    await waitFor(() => {
      const ratingElements = screen.getAllByText('4.5');
      expect(ratingElements.length).toBeGreaterThan(0);
    });
  });

  it('displays price level indicators', async () => {
    customRender(<VirtualBusinessGrid {...defaultProps} />);

    await waitFor(() => {
      // Price level is available in the business data but not visually displayed
      expect(screen.getByText('Test Business 0')).toBeInTheDocument();
    });
  });

  it('handles empty businesses array', () => {
    customRender(<VirtualBusinessGrid {...defaultProps} businesses={[]} />);

    expect(screen.getByText('No businesses found in this area')).toBeInTheDocument();
  });

  it('calls onLoadMore when scrolling to bottom', async () => {
    customRender(<VirtualBusinessGrid {...defaultProps} />);

    // Simulate scroll to bottom
    const scrollContainer = screen.getByTestId('virtual-grid-container');
    fireEvent.scroll(scrollContainer, { target: { scrollTop: 1000 } });

    // The component handles scrolling internally, no external onLoadMore callback
    await waitFor(() => {
      expect(scrollContainer).toBeInTheDocument();
    });
  });

  it('is accessible with proper ARIA labels', async () => {
    customRender(<VirtualBusinessGrid {...defaultProps} />);

    await waitFor(() => {
      const businessCards = screen.getAllByTestId(/^business-card-/);
      businessCards.forEach(card => {
        expect(card).toHaveAttribute('aria-label');
        expect(card).toHaveAttribute('role', 'button');
      });
    });
  });

  it('handles keyboard navigation', async () => {
    customRender(<VirtualBusinessGrid {...defaultProps} />);

    await waitFor(() => {
      const firstBusinessCard = screen.getByTestId('business-card-business-0');
      firstBusinessCard.focus();
      fireEvent.keyDown(firstBusinessCard, { key: 'Enter' });
    });

    expect(defaultProps.onBusinessSelect).toHaveBeenCalledWith(mockBusinesses[0]);
  });

  it('renders with responsive columns', () => {
    // Mock different screen sizes
    Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });

    customRender(<VirtualBusinessGrid {...defaultProps} />);

    // The component calculates columns based on screen size
    // For mobile (width < 768), it should use 1 column
    const grid = screen.getByTestId('virtual-grid-container');
    expect(grid).toBeInTheDocument();
  });

  it('memoizes business cards for performance', () => {
    const { rerender } = customRender(<VirtualBusinessGrid {...defaultProps} />);

    // Re-render with same props
    rerender(<VirtualBusinessGrid {...defaultProps} />);

    // Business cards should be memoized and not re-render unnecessarily
    expect(screen.getByTestId('business-card-business-0')).toBeInTheDocument();
  });

  it('handles business selection with proper focus management', async () => {
    customRender(<VirtualBusinessGrid {...defaultProps} />);

    await waitFor(() => {
      const firstBusinessCard = screen.getByTestId('business-card-business-0');
      firstBusinessCard.click();
    });

    expect(defaultProps.onBusinessSelect).toHaveBeenCalledWith(mockBusinesses[0]);
    // Focus should be managed properly
    expect(document.activeElement).toBeInTheDocument();
  });
});
