# Testing and CI

Each component owns its own tests:

- **Frontend** — `frontend/tests/`
- **Backend** — `backend/tests/`
- **Hardware simulation** — `hardwareSimulation/tests/`

CI will run tests for all components so that changes in one area don’t break others.
