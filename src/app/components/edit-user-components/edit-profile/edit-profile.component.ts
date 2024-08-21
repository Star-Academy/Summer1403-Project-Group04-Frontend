import { Component, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { UserData } from '../../../models/user-data';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../../../services/notification/notification.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [NzModalModule, NgIf, NgFor, NgClass, ReactiveFormsModule],
  providers: [FormBuilder, Validators],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnChanges {
  @Input() userData!: UserData;
  protected userForm!: FormGroup;
  protected isSubmitted = false;
  protected isUpdatingProfile = false;

  formControls = [
    {
      name: 'firstName',
      type: 'text',
      placeholder: 'First Name',
      minLength: 1,
    },
    {
      name: 'lastName',
      type: 'text',
      placeholder: 'Last Name',
      minLength: 1,
    },
    { name: 'email', type: 'email', placeholder: 'Email', minLength: 1 },
    { name: 'username', type: 'text', placeholder: 'User Name', minLength: 3 },
  ];

  constructor(
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private userService: UserService,
    private notificationService: NotificationService
  ) {
    this.initializeForm();
  }

  ngOnChanges(): void {
    this.initializeForm();

    this.activeRoute.queryParams.subscribe(async (params) => {
      this.isUpdatingProfile = params['id'] ? false : true;
    });
  }

  private initializeForm() {
    this.userForm = this.fb.group({
      firstName: [this.userData ? this.userData.firstName : '', [Validators.required, Validators.minLength(1)]],
      lastName: [this.userData ? this.userData.lastName : '', [Validators.required, Validators.minLength(1)]],
      email: [
        this.userData ? this.userData.email : '',
        [Validators.required, Validators.minLength(1), Validators.email],
      ],
      username: [this.userData ? this.userData.username : '', [Validators.required, Validators.minLength(3)]],
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.userForm.valid) {
      if (this.isUpdatingProfile) {
        this.handleUpdateProfile();
      } else {
        this.handleUpdateUser();
      }
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  private handleUpdateProfile() {
    this.userService.updateUser(null, this.userForm, this.isUpdatingProfile).subscribe({
      next: (response) => {
        if (response.message === 'User updated successfully!') {
          const successMessage = 'Success';
          this.notificationService.createNotification('success', successMessage, response.message);
        } else {
          const errorMessage = this.isUpdatingProfile ? 'Error Updating Profile' : 'Error Updating User';
          this.notificationService.createNotification('error', errorMessage, response.message);
        }
      },
      error: (error: HttpErrorResponse) => {
        let errorMessage = 'An unexpected error occurred';
        if (error.status === 401) {
          errorMessage = 'Unauthorized: Invalid username or password';
        } else if (error.status === 400) {
          errorMessage = 'Bad Request: Please check your inputs';
        }

        this.notificationService.createNotification('error', 'Unexpected Error', errorMessage);
      },
    });
  }

  private handleUpdateUser() {
    this.userService.updateUser(this.userData.id, this.userForm, this.isUpdatingProfile).subscribe({
      next: (response) => {
        if (response.message === 'User updated successfully!') {
          const successMessage = 'Success';
          this.notificationService.createNotification('success', successMessage, response.message);
        } else {
          const errorMessage = 'Error Updating User';
          this.notificationService.createNotification('error', errorMessage, response.message);
        }
      },
      error: (error: HttpErrorResponse) => {
        let errorMessage = 'An unexpected error occurred';
        if (error.status === 401) {
          errorMessage = 'Unauthorized: Invalid username or password';
        } else if (error.status === 400) {
          errorMessage = 'Bad Request: Please check your inputs';
        }

        this.notificationService.createNotification('error', 'Unexpected Error', errorMessage);
      },
    });
  }
}

// .subscribe({
//   next: () => {
//     this.notificationService.createNotification('info', 'Logged Out', 'You have been logged out successfully.');

//     setTimeout(() => {
//       this.router.navigate(['/landing']);
//     }, 2000);
//   },
//   error: (error: HttpErrorResponse) => {
//     console.error('Error logging out', error);
//   },
// });
