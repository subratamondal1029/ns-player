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

	if *timestamp.Current.Index != 0 && *timestamp.Current.Index == *timestamp.Previous.Index {
		return fmt.Errorf("Validation failed :: current.index should not be the same as previous.index, excepts 0")
	}

	if (*timestamp.Previous.Index == 0 && *timestamp.Current.Index == 0) && *timestamp.Previous.Timestamp != 0 {
		return fmt.Errorf("Validation failed :: if both the index is 0, previous.timestamp should be 0")
	}

	return nil
}
