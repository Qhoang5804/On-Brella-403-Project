import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PersonalInfoPage } from "../src/pages/PersonalInfoPage";

const mockUpdateUser = vi.fn();

vi.mock("../src/context/UserContext", () => ({
  useUser: () => ({
    user: {
      id: "user-1",
      name: "Jane Doe",
      email: "jane@example.com",
      description: "Bio text",
    },
    loading: false,
    updateUser: mockUpdateUser,
  }),
}));

describe("PersonalInfoPage", () => {
  beforeEach(() => {
    mockUpdateUser.mockReset();
  });

  it("renders personal information heading and back to account link", () => {
    render(
      <MemoryRouter>
        <PersonalInfoPage />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: /Personal Information/i })).toBeInTheDocument();
    expect(screen.getByText("Back to account")).toBeInTheDocument();
  });

  it("shows user name and email when not editing", () => {
    render(
      <MemoryRouter>
        <PersonalInfoPage />
      </MemoryRouter>
    );
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("calls updateUser when Save is clicked after changing name", async () => {
    render(
      <MemoryRouter>
        <PersonalInfoPage />
      </MemoryRouter>
    );
    const nameInput = screen.getByPlaceholderText(/Full name/i);
    fireEvent.change(nameInput, { target: { value: "Jane Smith" } });
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Jane Smith",
          email: "jane@example.com",
        })
      );
    });
  });

  it("shows validation error when saving with empty name", async () => {
    render(
      <MemoryRouter>
        <PersonalInfoPage />
      </MemoryRouter>
    );
    const nameInput = screen.getByPlaceholderText(/Full name/i);
    fireEvent.clear(nameInput);
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() => {
      expect(screen.getByText("Name is required.")).toBeInTheDocument();
    });
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });
});
