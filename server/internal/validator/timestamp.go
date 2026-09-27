package validator

import (
	"fmt"

	"github.com/go-playground/validator/v10"
	"github.com/subratamondal1029/ns-player/internal/service"
)

var validate = validator.New(
	validator.WithRequiredStructEnabled(),
)

func ValidateTimestamp(timestamp *service.Timestamp) error {
	err := validate.Struct(timestamp)

	if err != nil {
		return fmt.Errorf("Validation failed :: %w", err)
	}

	return nil
}
