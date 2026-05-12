import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {describe, expect, it} from 'vitest';
import Header from '@/Pages/HomePage/components/Header.jsx'

describe('Header Component (UI Tests)', () => {
  it('Має рендерити логотип Lysto', () => {
    render(
      <MemoryRouter>
        <Header/>
      </MemoryRouter>
    );

    const logoElement = screen.getByText('Lysto');

    expect(logoElement).toBeDefined();
  });

  it('Має містити посилання на Авторизацію та Чати', () => {
    render(
      <MemoryRouter>
        <Header/>
      </MemoryRouter>
    );

    expect(screen.getByText('Авторизація')).toBeDefined();
    expect(screen.getByText('Відкрити чати')).toBeDefined();
  });
});