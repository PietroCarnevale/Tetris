package daaw.tetris_api.persistence.repo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import daaw.tetris_api.persistence.model.Score;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {

    List<Score> findTop10ByOrderByLinesDesc();

}