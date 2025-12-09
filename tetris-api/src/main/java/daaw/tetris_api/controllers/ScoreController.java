package daaw.tetris_api.controllers;

import daaw.tetris_api.persistence.repo.ScoreRepository;
import daaw.tetris_api.persistence.model.Score;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;



@RestController
@CrossOrigin(origins = "*")
public class ScoreController {

    private final ScoreRepository scoreRepository;

    public ScoreController(ScoreRepository scoreRepository) {
        this.scoreRepository = scoreRepository;
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<Score>> getTopScores() {
        List<Score> scores = scoreRepository.findTop10ByOrderByLinesDesc();
        return ResponseEntity.ok(scores);
    }
    
    @PostMapping(value = "/ranking", consumes = "application/json", produces = "application/json")
    public ResponseEntity<Score> saveScore(@RequestBody Score score) {
        Score saved = scoreRepository.save(score);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    

}