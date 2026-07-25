"""Mock-only interview business logic."""

from __future__ import annotations

from itertools import cycle, islice

from backend.schemas.interview import (
    InterviewAnswerRequest,
    InterviewAnswerResponse,
    InterviewEndRequest,
    InterviewEndResponse,
    InterviewQuestion,
    InterviewStartRequest,
    InterviewStartResponse,
    InterviewSummary,
)
from backend.services.interview_session_manager import (
    InterviewCompletedError,
    InterviewSession,
    InterviewSessionManager,
    InterviewStatus,
    InvalidInterviewStateError,
)


MOCK_QUESTIONS = (
    "What is supervised learning?",
    "What is overfitting?",
    "What is normalization?",
    "How would you explain the difference between classification and regression?",
    "What is the purpose of splitting data into training and test sets?",
    "How do you approach debugging a program that produces incorrect output?",
    "What is the difference between a list and a dictionary in Python?",
    "How would you communicate a technical result to a non-technical stakeholder?",
    "What steps would you take before deploying a machine learning model?",
    "Describe a project where you had to learn a new technical skill.",
)
MOCK_FEEDBACK = "Answer recorded successfully."
MOCK_OVERALL_FEEDBACK = "Interview completed successfully."


class InterviewService:
    """Coordinate mock interview sessions without external services."""

    def __init__(
        self,
        session_manager: InterviewSessionManager | None = None,
    ) -> None:
        self.session_manager = session_manager or InterviewSessionManager()

    def start_interview(
        self,
        request: InterviewStartRequest,
    ) -> InterviewStartResponse:
        """Create a mock interview and return its first question."""

        questions = list(
            islice(cycle(MOCK_QUESTIONS), request.number_of_questions)
        )
        session = self.session_manager.create_interview(
            learning_goal=request.learning_goal,
            interview_role=request.interview_role,
            difficulty=request.difficulty,
            question_list=questions,
        )
        return InterviewStartResponse(
            interview_id=session.interview_id,
            current_question=self._question_for_session(session),
        )

    def submit_answer(
        self,
        request: InterviewAnswerRequest,
    ) -> InterviewAnswerResponse:
        """Record an answer and advance to the next mock question."""

        def record_answer(session: InterviewSession) -> None:
            if session.status is InterviewStatus.COMPLETED:
                raise InterviewCompletedError(
                    "Interview has already been completed."
                )
            self._validate_question_index(session)
            if len(session.candidate_answers) != session.current_question_index:
                raise InvalidInterviewStateError(
                    "Interview answer state is inconsistent."
                )

            session.candidate_answers.append(request.answer)
            session.current_question_index += 1
            if session.current_question_index >= session.total_questions:
                session.status = InterviewStatus.COMPLETED

        session = self.session_manager.update_interview(
            request.interview_id,
            record_answer,
        )
        is_complete = session.status is InterviewStatus.COMPLETED
        return InterviewAnswerResponse(
            feedback=MOCK_FEEDBACK,
            next_question=(
                None if is_complete else self._question_for_session(session)
            ),
            is_interview_complete=is_complete,
        )

    def end_interview(
        self,
        request: InterviewEndRequest,
    ) -> InterviewEndResponse:
        """Return a mock summary and delete the in-memory session."""

        session = self.session_manager.end_interview(request.interview_id)
        summary = InterviewSummary(
            technical_score=80,
            communication_score=75,
            confidence_score=82,
            questions_answered=len(session.candidate_answers),
            overall_feedback=MOCK_OVERALL_FEEDBACK,
        )
        self.session_manager.delete_interview(request.interview_id)
        return InterviewEndResponse(summary=summary)

    def _question_for_session(
        self,
        session: InterviewSession,
    ) -> InterviewQuestion:
        """Build the candidate-facing question for the current index."""

        self._validate_question_index(session)
        question_number = session.current_question_index + 1
        return InterviewQuestion(
            question_id=f"{session.interview_id}-question-{question_number}",
            question_number=question_number,
            total_questions=session.total_questions,
            question=session.question_list[session.current_question_index],
        )

    def _validate_question_index(self, session: InterviewSession) -> None:
        """Reject an invalid active question index."""

        if not 0 <= session.current_question_index < session.total_questions:
            raise InvalidInterviewStateError(
                "Interview has an invalid current question index."
            )
